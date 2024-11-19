import { Elysia, t } from 'elysia'
import Redis from 'ioredis'
import { buildMimc7 as buildMimc } from 'circomlibjs'
import { MerkleTreeMiMC, MiMC7 } from '../lib/merkle-tree'
import { fetchTopOwners, Owner } from '../lib/simplehash'
import {
  verifyProofForCreate,
  verifyProofForDelete,
  verifyProofForPromote,
} from '../lib/proof'
import cors from '@elysiajs/cors'
import { Logestic } from 'logestic'
import {
  createPostMapping,
  createSignerForAddress,
  getPostMapping,
  getSignerForAddress,
} from '@anon/db'
import { GetCastResponse, GetCastsResponse, PostCastResponse } from './types'
import crypto from 'crypto'
import { TOKEN_CONFIG } from '../lib/config'
import { SendTweetV2Params, TwitterApi } from 'twitter-api-v2'
import * as https from 'https'

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY as string,
  appSecret: process.env.TWITTER_API_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
})

const zeroHex = '0x0000000000000000000000000000000000000000'

const redis = new Redis(process.env.REDIS_URL as string)

const app = new Elysia()
  //   .onError(({ server, error, path }) => {
  //     console.log(path, error)
  //     server?.stop()
  //     process.exit(1)
  //   })
  .use(cors().use(Logestic.preset('common')))
  //   .get('/twitter/auth-link', async () => {
  //     const authLink = await twitterClient.generateAuthLink('http://localhost:3000')
  //     console.log(authLink)
  //     return {
  //       authLink,
  //     }
  //   })
  //   .get('/twitter/persist-tokens', async () => {
  //     try {
  //       const result = await twitterClient.login(
  //         process.env.TWITTER_OAUTH_VERIFIER as string
  //       )
  //       console.log(result.accessToken, result.accessSecret, result)
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   })
  //   .get('/twitter/post', async () => {
  //     const result = await twitterClient.v2.tweet('test')
  //     console.log(result)
  //   })
  .get(
    '/merkle-tree/:tokenAddress',
    ({ params }) => fetchTree(params.tokenAddress, 'create'),
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )
  .get(
    '/merkle-tree/:tokenAddress/delete',
    ({ params }) => fetchTree(params.tokenAddress, 'delete'),
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )
  .get(
    '/merkle-tree/:tokenAddress/promote',
    ({ params }) => fetchTree(params.tokenAddress, 'promote'),
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )
  .post('/post', ({ body }) => submitPost(body.proof, body.publicInputs), {
    body: t.Object({
      proof: t.Array(t.Number()),
      publicInputs: t.Array(t.Array(t.Number())),
    }),
  })
  .get('/get-cast', ({ query }) => getCast(query.identifier), {
    query: t.Object({
      identifier: t.String(),
    }),
  })
  .post(
    '/update-signer',
    ({ body }) => createSignerForAddress(body.address, body.signerUuid),
    {
      body: t.Object({
        address: t.String(),
        signerUuid: t.String(),
      }),
    }
  )
  .get('/validate-frame', ({ query }) => validateFrame(query.data), {
    query: t.Object({
      data: t.String(),
    }),
  })
  .get('/posts/:tokenAddress', ({ params }) => getPosts(params.tokenAddress), {
    params: t.Object({
      tokenAddress: t.String(),
    }),
  })
  .get(
    '/posts/:tokenAddress/trending',
    ({ params }) => getTrendingPosts(params.tokenAddress),
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )
  .post('/post/delete', ({ body }) => deletePost(body.proof, body.publicInputs), {
    body: t.Object({
      proof: t.Array(t.Number()),
      publicInputs: t.Array(t.Array(t.Number())),
    }),
  })
  .post('/post/promote', ({ body }) => promotePost(body.proof, body.publicInputs), {
    body: t.Object({
      proof: t.Array(t.Number()),
      publicInputs: t.Array(t.Array(t.Number())),
    }),
  })

app.listen(3001)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

async function fetchTree(tokenAddress: string, mode: 'create' | 'delete' | 'promote') {
  const data = await redis.get(`anon:tree:${tokenAddress.toLowerCase()}:${mode}`)
  if (data) {
    return JSON.parse(data)
  }

  const tree = await createTree({ tokenAddress, mode })
  await redis.set(
    `anon:tree:${tokenAddress.toLowerCase()}:${mode}`,
    JSON.stringify(tree),
    'EX',
    60 * 5
  )

  return tree
}

export async function createTree({
  tokenAddress,
  mode,
}: { tokenAddress: string; mode: 'create' | 'delete' | 'promote' }) {
  const mimc = await buildMimc()
  const merkleTree = new MerkleTreeMiMC(11, mimc)

  const owners = await fetchOwners(tokenAddress, mode)
  for (const owner of owners) {
    const commitment = MiMC7(
      mimc,
      owner.owner_address.toLowerCase().replace('0x', ''),
      BigInt(owner.quantity_string).toString(16).replace('0x', '')
    )
    merkleTree.insert(commitment)
  }

  const root = `0x${merkleTree.root()}`

  const elements = owners.map((owner, index) => {
    return {
      path: merkleTree.proof(index).pathElements.map((p) => `0x${p}` as string),
      address: owner.owner_address.toLowerCase(),
      balance: owner.quantity_string,
    }
  })

  const tree = {
    root,
    elements,
  }

  return tree
}

async function fetchOwners(
  tokenAddress: string,
  mode: 'create' | 'delete' | 'promote'
): Promise<Array<Owner>> {
  const data = await redis.get(`anon:owners:${tokenAddress.toLowerCase()}:${mode}`)
  if (data) {
    return JSON.parse(data)
  }

  const owners = await fetchTopOwners(tokenAddress, mode)
  await redis.set(
    `anon:owners:${tokenAddress.toLowerCase()}:${mode}`,
    JSON.stringify(owners),
    'EX',
    60 * 5
  )

  return owners
}

async function submitPost(proof: number[], publicInputs: number[][]) {
  let isValid = false
  try {
    isValid = await verifyProofForCreate(proof, publicInputs)
  } catch (e) {
    console.error(e)
  }

  if (!isValid) {
    throw new Error('Invalid proof')
  }

  const params = extractCreateData(publicInputs)

  if (params.timestamp < Date.now() / 1000 - 600) {
    return {
      success: false,
    }
  }

  const signerUuid = await getSignerForAddress(params.tokenAddress)

  const embeds: Array<{
    url?: string
    castId?: { hash: string; fid: number }
  }> = params.embeds.map((embed) => ({
    url: embed,
  }))

  if (params.quote) {
    const quote = await getCast(params.quote)
    embeds.push({
      castId: {
        hash: quote.cast.hash,
        fid: quote.cast.author.fid,
      },
    })
  }

  let parentAuthorFid = undefined
  if (params.parent) {
    const parent = await getCast(params.parent)
    parentAuthorFid = parent.cast.author.fid
  }

  const body = {
    signer_uuid: signerUuid.signerUuid,
    parent: params.parent,
    parent_author_fid: parentAuthorFid,
    text: params.text,
    embeds,
  }

  const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex')

  const exists = await redis.get(`post:hash:${hash}`)
  if (exists) {
    console.log('Duplicate submission detected')
    return {
      success: false,
    }
  }

  await redis.set(`post:hash:${hash}`, 'true', 'EX', 60 * 5)

  const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': process.env.NEYNAR_API_KEY as string,
    },
  })
  if (!response.ok) {
    console.error(response)
    return {
      success: false,
    }
  }

  const data: PostCastResponse = await response.json()

  return data
}

function extractCreateData(data: number[][]): {
  timestamp: number
  root: string
  text: string
  embeds: string[]
  quote: string
  channel: string
  parent: string
  tokenAddress: string
} {
  const root = `0x${Buffer.from(data[0]).toString('hex')}`

  const timestampBuffer = Buffer.from(data[1])
  let timestamp = 0
  for (let i = 0; i < timestampBuffer.length; i++) {
    timestamp = timestamp * 256 + timestampBuffer[i]
  }

  const textArrays = data.slice(2, 2 + 16)
  // @ts-ignore
  const textBytes = [].concat(...textArrays)
  const decoder = new TextDecoder('utf-8')
  const text = decoder.decode(Uint8Array.from(textBytes)).replace(/\0/g, '')

  const embed1Array = data.slice(2 + 16, 2 + 32)
  // @ts-ignore
  const embed1Bytes = [].concat(...embed1Array)
  const embed1Decoder = new TextDecoder('utf-8')
  const embed1 = embed1Decoder.decode(Uint8Array.from(embed1Bytes)).replace(/\0/g, '')

  const embed2Array = data.slice(2 + 32, 2 + 48)
  // @ts-ignore
  const embed2Bytes = [].concat(...embed2Array)
  const embed2Decoder = new TextDecoder('utf-8')
  const embed2 = embed2Decoder.decode(Uint8Array.from(embed2Bytes)).replace(/\0/g, '')

  const quoteArray = data[2 + 48]
  const quote = `0x${Buffer.from(quoteArray).toString('hex').slice(-40)}`

  const channelArray = data[2 + 48 + 1]
  const channelDecoder = new TextDecoder('utf-8')
  const channel = channelDecoder.decode(Uint8Array.from(channelArray)).replace(/\0/g, '')

  const parentArray = data[2 + 48 + 2]
  const parent = `0x${Buffer.from(parentArray).toString('hex').slice(-40)}`

  const tokenAddressArray = data[2 + 48 + 3]
  const tokenAddress = `0x${Buffer.from(tokenAddressArray).toString('hex').slice(-40)}`

  return {
    timestamp,
    root: root as string,
    text,
    embeds: [embed1, embed2].filter((e) => e !== ''),
    quote: quote === zeroHex ? '' : quote,
    channel,
    parent: parent === zeroHex ? '' : parent,
    tokenAddress: tokenAddress as string,
  }
}

function extractDeleteData(data: number[][]): {
  timestamp: number
  root: string
  hash: string
  tokenAddress: string
} {
  const root = `0x${Buffer.from(data[0]).toString('hex')}`

  const timestampBuffer = Buffer.from(data[1])
  let timestamp = 0
  for (let i = 0; i < timestampBuffer.length; i++) {
    timestamp = timestamp * 256 + timestampBuffer[i]
  }

  const hashArray = data[2]
  const hash = `0x${Buffer.from(hashArray).toString('hex').slice(-40)}`

  const tokenAddressArray = data[3]
  const tokenAddress = `0x${Buffer.from(tokenAddressArray).toString('hex').slice(-40)}`

  return {
    timestamp,
    root: root as string,
    hash,
    tokenAddress: tokenAddress as string,
  }
}

function extractPromoteData(data: number[][]): {
  timestamp: number
  root: string
  hash: string
  tokenAddress: string
} {
  const root = `0x${Buffer.from(data[0]).toString('hex')}`

  const timestampBuffer = Buffer.from(data[1])
  let timestamp = 0
  for (let i = 0; i < timestampBuffer.length; i++) {
    timestamp = timestamp * 256 + timestampBuffer[i]
  }

  const hashArray = data[2]
  const hash = `0x${Buffer.from(hashArray).toString('hex').slice(-40)}`

  const tokenAddressArray = data[3]
  const tokenAddress = `0x${Buffer.from(tokenAddressArray).toString('hex').slice(-40)}`

  return {
    timestamp,
    root: root as string,
    hash,
    tokenAddress: tokenAddress as string,
  }
}

async function getCast(identifier: string): Promise<GetCastResponse> {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/cast?type=${
      identifier.startsWith('0x') ? 'hash' : 'url'
    }&identifier=${identifier}`,
    {
      headers: {
        'x-api-key': process.env.NEYNAR_API_KEY as string,
        Accept: 'application/json',
      },
    }
  )

  return await response.json()
}

async function validateFrame(message_bytes_in_hex: string) {
  const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
    method: 'POST',
    body: JSON.stringify({ message_bytes_in_hex }),
    headers: {
      'x-api-key': process.env.NEYNAR_API_KEY as string,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return await response.json()
}

async function getPosts(tokenAddress: string) {
  const fid = TOKEN_CONFIG[tokenAddress].fid
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=fids&fids=${fid}&with_recasts=false&limit=100`,
    {
      headers: {
        'x-api-key': process.env.NEYNAR_API_KEY as string,
        Accept: 'application/json',
      },
    }
  )
  return await response.json()
}

async function getTrendingPosts(tokenAddress: string) {
  const trending = await redis.get(`trending:${tokenAddress}`)
  if (!trending) {
    return {
      casts: [],
    }
  }

  const castsWithScores: [string, number][] = JSON.parse(trending)

  const hashes = castsWithScores.map((cast) => cast[0])

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/casts?casts=${hashes.join(',')}`,
    {
      headers: {
        'x-api-key': process.env.NEYNAR_API_KEY as string,
        Accept: 'application/json',
      },
    }
  )

  const data: { result: GetCastsResponse } = await response.json()

  return {
    casts: data.result.casts,
  }
}

async function deletePost(proof: number[], publicInputs: number[][]) {
  let isValid = false
  try {
    isValid = await verifyProofForDelete(proof, publicInputs)
  } catch (e) {
    console.error(e)
  }

  if (!isValid) {
    throw new Error('Invalid proof')
  }

  const params = extractDeleteData(publicInputs)
  if (params.timestamp < Date.now() / 1000 - 600) {
    return {
      success: false,
    }
  }

  const signerUuid = await getSignerForAddress(params.tokenAddress)

  const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
    method: 'DELETE',
    body: JSON.stringify({
      signer_uuid: signerUuid.signerUuid,
      target_hash: params.hash,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': process.env.NEYNAR_API_KEY as string,
    },
  })

  const postMapping = await getPostMapping(params.hash)
  if (postMapping) {
    await twitterClient.v2.deleteTweet(postMapping.tweetId)
  }

  return await response.json()
}

async function promotePost(proof: number[], publicInputs: number[][]) {
  let isValid = false
  try {
    isValid = await verifyProofForPromote(proof, publicInputs)
  } catch (e) {
    console.error(e)
  }

  if (!isValid) {
    throw new Error('Invalid proof')
  }

  const params = extractPromoteData(publicInputs)
  if (params.timestamp < Date.now() / 1000 - 600) {
    return {
      success: false,
    }
  }

  const mapping = await getPostMapping(params.hash)
  if (mapping?.tweetId) {
    return {
      success: true,
    }
  }

  const cast = await getCast(params.hash)
  if (!cast.cast) {
    return {
      success: false,
    }
  }

  const twitterEmbed = cast.cast?.embeds?.find(
    (e) => e.url?.includes('x.com') || e.url?.includes('twitter.com')
  )

  let quoteTweetId: string | undefined
  if (twitterEmbed && twitterEmbed.url) {
    const url = new URL(twitterEmbed.url)
    const tweetId = url.pathname.split('/').pop()
    if (tweetId) {
      quoteTweetId = tweetId
    }
  }

  const otherEmbeds = cast.cast?.embeds?.filter(
    (e) =>
      !e.url?.includes('x.com') &&
      !e.url?.includes('twitter.com') &&
      !e.metadata?.content_type?.startsWith('image')
  )

  const usedUrls = new Set<string>()

  let text = cast.cast.text
  for (const embed of otherEmbeds) {
    if (embed.url) {
      if (!usedUrls.has(embed.url)) {
        text += `\n\n${embed.url}`
        usedUrls.add(embed.url)
      }
    } else if (embed.cast) {
      const url = `https://warpcast.com/${
        embed.cast.author.username
      }/${embed.cast.hash.slice(0, 10)}`
      if (!usedUrls.has(url)) {
        text += `\n\n${url}`
        usedUrls.add(url)
      }
    }
  }

  const image = cast.cast?.embeds?.find((e) =>
    e.metadata?.content_type?.startsWith('image')
  )?.url

  const tweet = await postToTwitter(text, image, quoteTweetId)
  if (!tweet) {
    return {
      success: false,
    }
  }

  await createPostMapping(cast.cast.hash, tweet.id)

  return {
    success: true,
    tweetId: tweet.id,
  }
}

async function postToTwitter(text: string, image?: string, quoteTweetId?: string) {
  try {
    let mediaId: string | undefined
    if (image) {
      const { data: binaryData, mimeType } = await new Promise<{
        data: Buffer
        mimeType: string
      }>((resolve, reject) => {
        https
          .get(image, (res) => {
            res.setEncoding('binary')
            let data = Buffer.alloc(0)

            res.on('data', (chunk) => {
              data = Buffer.concat([data, Buffer.from(chunk, 'binary')])
            })
            res.on('end', () => {
              const mimeType = res.headers['content-type'] || 'image/jpeg'
              resolve({ data, mimeType })
            })
          })
          .on('error', (e) => {
            reject(e)
          })
      })
      mediaId = await twitterClient.v1.uploadMedia(binaryData as unknown as Buffer, {
        mimeType,
      })
    }

    const params: SendTweetV2Params = {}
    if (mediaId) {
      params.media = {
        media_ids: [mediaId],
      }
    }

    if (quoteTweetId) {
      params.quote_tweet_id = quoteTweetId
    }

    const result = await twitterClient.v2.tweet(text, params)

    if (result?.data?.id) {
      return {
        id: result.data.id,
      }
    }
  } catch (e) {
    console.error(e)
  }
}

import { createElysia } from '../utils'
import { t } from 'elysia'
import { ProofType, verifyProof } from '@anon/utils/src/proofs'
import { zeroAddress } from 'viem'
import { CreatePostParams, SubmitHashParams } from '../services/types'
import { neynar } from '../services/neynar'
import { promoteToTwitter } from '../services/twitter'
import { createPostMapping, getPostMapping } from '@anon/db'
import { getQueue, QueueName } from '@anon/queue/src/utils'
import { Noir } from '@noir-lang/noir_js'

export function getPostRoutes(createPostBackend: Noir, submitHashBackend: Noir) {
  return createElysia({ prefix: '/posts' })
    .decorate('createPostBackend', createPostBackend)
    .decorate('submitHashBackend', submitHashBackend)
    .post(
      '/submit',
      async ({ body }) => {
        if (body.type === ProofType.PROMOTE_POST) {
          await getQueue(QueueName.PromotePost).add(`${body.type}-${Date.now()}`, body)
        } else {
          await getQueue(QueueName.Default).add(`${body.type}-${Date.now()}`, body)
        }
      },
      {
        body: t.Object({
          type: t.Enum(ProofType),
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.Array(t.Number())),
        }),
      }
    )
    .post(
      '/create',
      async ({ body, createPostBackend }) => {
        const isValid = await createPostBackend.verifyFinalProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs.map((i) => new Uint8Array(i)),
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }

        const params = extractCreatePostData(body.publicInputs)
        if (params.timestamp < Date.now() / 1000 - 600) {
          return {
            success: false,
          }
        }

        return await neynar.post(params)
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.Array(t.Number())),
        }),
      }
    )
    .post(
      '/delete',
      async ({ body, submitHashBackend }) => {
        const isValid = await submitHashBackend.verifyFinalProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs.map((i) => new Uint8Array(i)),
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }

        const params = extractSubmitHashData(body.publicInputs)
        if (params.timestamp < Date.now() / 1000 - 600) {
          return {
            success: false,
          }
        }

        return await neynar.delete(params)
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.Array(t.Number())),
        }),
      }
    )
    .post(
      '/promote',
      async ({ body, submitHashBackend }) => {
        const isValid = await submitHashBackend.verifyFinalProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs.map((i) => new Uint8Array(i)),
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }

        const params = extractSubmitHashData(body.publicInputs)
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

        const cast = await neynar.getCast(params.hash)
        if (!cast.cast) {
          return {
            success: false,
          }
        }

        const tweetId = await promoteToTwitter(cast.cast)

        if (!tweetId) {
          return {
            success: false,
          }
        }

        await createPostMapping(params.hash, tweetId)

        return {
          success: true,
          tweetId,
        }
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.Array(t.Number())),
        }),
      }
    )
}

function extractCreatePostData(data: number[][]): CreatePostParams {
  const root = `0x${Buffer.from(data[0]).toString('hex')}`

  const tokenAddressArray = data[1]
  const tokenAddress = `0x${Buffer.from(tokenAddressArray).toString('hex').slice(-40)}`

  const timestampBuffer = Buffer.from(data[2])
  let timestamp = 0
  for (let i = 0; i < timestampBuffer.length; i++) {
    timestamp = timestamp * 256 + timestampBuffer[i]
  }

  const textArrays = data.slice(3, 3 + 16)
  // @ts-ignore
  const textBytes = [].concat(...textArrays)
  const decoder = new TextDecoder('utf-8')
  const text = decoder.decode(Uint8Array.from(textBytes)).replace(/\0/g, '')

  const embed1Array = data.slice(3 + 16, 3 + 32)
  // @ts-ignore
  const embed1Bytes = [].concat(...embed1Array)
  const embed1Decoder = new TextDecoder('utf-8')
  const embed1 = embed1Decoder.decode(Uint8Array.from(embed1Bytes)).replace(/\0/g, '')

  const embed2Array = data.slice(3 + 32, 3 + 48)
  // @ts-ignore
  const embed2Bytes = [].concat(...embed2Array)
  const embed2Decoder = new TextDecoder('utf-8')
  const embed2 = embed2Decoder.decode(Uint8Array.from(embed2Bytes)).replace(/\0/g, '')

  const quoteArray = data[3 + 48]
  const quote = `0x${Buffer.from(quoteArray).toString('hex').slice(-40)}`

  const channelArray = data[3 + 48 + 1]
  const channelDecoder = new TextDecoder('utf-8')
  const channel = channelDecoder.decode(Uint8Array.from(channelArray)).replace(/\0/g, '')

  const parentArray = data[3 + 48 + 2]
  const parent = `0x${Buffer.from(parentArray).toString('hex').slice(-40)}`

  return {
    timestamp,
    root: root as string,
    text,
    embeds: [embed1, embed2].filter((e) => e !== ''),
    quote: quote === zeroAddress ? '' : quote,
    channel,
    parent: parent === zeroAddress ? '' : parent,
    tokenAddress: tokenAddress as string,
  }
}

function extractSubmitHashData(data: number[][]): SubmitHashParams {
  const root = `0x${Buffer.from(data[0]).toString('hex')}`

  const tokenAddressArray = data[1]
  const tokenAddress = `0x${Buffer.from(tokenAddressArray).toString('hex').slice(-40)}`

  const timestampBuffer = Buffer.from(data[2])
  let timestamp = 0
  for (let i = 0; i < timestampBuffer.length; i++) {
    timestamp = timestamp * 256 + timestampBuffer[i]
  }

  const hashArray = data[3]
  const hash = `0x${Buffer.from(hashArray).toString('hex').slice(-40)}`

  return {
    timestamp,
    root: root as string,
    hash,
    tokenAddress: tokenAddress as string,
  }
}

import { createElysia } from '../utils'
import { t } from 'elysia'
import { merkleMembership } from '@anonworld/zk'
import { redis } from '../services/redis'
import { hashMessage } from 'viem'
import {
  createPost,
  createPostRelationship,
  deletePost,
  deletePostRelationship,
  getAction,
  getPost,
  getPostChildren,
  logActionExecution,
} from '@anonworld/db'
import { neynar } from '../services/neynar'
import { TwitterConfig, TwitterService } from '../services/twitter'

export const actionsRoutes = createElysia({ prefix: '/actions' }).post(
  '/submit',
  async ({ body }) => {
    const verified = await merkleMembership.verify({
      proof: new Uint8Array(body.proof.proof),
      publicInputs: body.proof.publicInputs,
    })
    if (!verified) {
      throw new Error('Invalid proof')
    }

    const { root } = await merkleMembership.extractData(body.proof.publicInputs)

    if (!(await redis.isValidMerkleTreeRoot(body.actionId, root))) {
      throw new Error('Invalid merkle tree root')
    }

    const hash = hashMessage(JSON.stringify(body.data))

    if (await redis.actionOccurred(body.actionId, hash)) {
      throw new Error('Action already occurred')
    }

    const action = await getAction(body.actionId)

    let response: any
    try {
      switch (action.actions.type) {
        case 'CREATE_POST': {
          response = await handleCreatePost(
            action.actions.metadata as { fid: number },
            body.data
          )
          break
        }
        case 'DELETE_POST': {
          response = await handleDeletePost(
            action.actions.metadata as { fid: number },
            body.data
          )
          break
        }
        case 'PROMOTE_POST': {
          response = await handlePromotePost(
            action.actions.metadata as { fid?: number; twitterConfig?: TwitterConfig },
            body.data
          )
          break
        }
      }
    } catch (error) {
      await logActionExecution({
        account_id: action.accounts.id,
        action_id: action.actions.id,
        action_data: body.data,
        status: 'FAILED',
        error: error,
      })
      throw error
    }

    await logActionExecution({
      account_id: action.accounts.id,
      action_id: action.actions.id,
      action_data: body.data,
      status: 'SUCCESS',
      response,
    })

    await redis.markActionOccurred(body.actionId, hash)

    return response
  },
  {
    body: t.Object({
      actionId: t.String(),
      proof: t.Object({
        proof: t.Array(t.Number()),
        publicInputs: t.Array(t.String()),
      }),
      data: t.Any(),
    }),
  }
)

async function handleCreatePost(
  { fid }: { fid: number },
  data: {
    text?: string
    embeds?: string[]
    quote?: string
    channel?: string
    parent?: string
    revealHash?: string
  }
) {
  const { text, embeds, quote, channel, parent, revealHash } = data

  const response = await neynar.createCast({
    fid,
    text,
    embeds,
    quote,
    channel,
    parent,
  })

  if (!response.success) {
    throw new Error('Failed to create cast')
  }

  await createPost({
    hash: response.cast.hash,
    fid,
    data: { ...data, revealHash: undefined },
    reveal_hash: revealHash,
  })

  return {
    success: true,
    hash: response.cast.hash,
  }
}

async function handleDeletePost(
  { fid, twitterConfig }: { fid: number; twitterConfig?: TwitterConfig },
  data: { hash: string }
) {
  const children = await getPostChildren([data.hash])
  for (const child of children) {
    if (child.target === 'farcaster') {
      if (fid === Number(child.target_account)) continue
      await neynar.deleteCast({
        fid,
        hash: child.target_id,
      })
      await deletePost(child.target_id)
    } else if (child.target === 'twitter' && twitterConfig) {
      const twitter = new TwitterService(twitterConfig)
      await twitter.deleteTweet(child.target_id)
    } else {
      continue
    }

    await deletePostRelationship({
      post_hash: data.hash,
      target: child.target,
      target_account: child.target_account,
    })
  }

  return { success: true }
}

async function handlePromotePost(
  { fid, twitterConfig }: { fid?: number; twitterConfig?: TwitterConfig },
  data: { hash: string; reply?: boolean }
) {
  const cast = await neynar.getCast(data.hash)
  if (!cast) {
    return { success: false }
  }

  let post = await getPost(data.hash)
  if (!post) {
    await createPost({
      hash: data.hash,
      fid: cast.cast.author.fid,
      data: {
        text: cast.cast.text,
        embeds: cast.cast.embeds.filter((embed) => embed.url).map((embed) => embed.url),
        quote: cast.cast.embeds.find((e) => e.cast)?.cast?.hash ?? null,
        channel: cast.cast.channel?.id ?? null,
        parent: cast.cast.parent_hash ?? null,
      },
      reveal_hash: null,
    })
    post = await getPost(data.hash)
  }

  const unableToPromoteRegex = [
    /.*@clanker.*launch.*/i,
    /.*dexscreener.com.*/i,
    /.*dextools.io.*/i,
    /.*0x[a-fA-F0-9]{40}.*/i,
    /(^|\s)\$(?!ANON\b)[a-zA-Z]+\b/i,
  ]
  if (
    twitterConfig &&
    (unableToPromoteRegex.some((regex) => cast.cast.text.match(regex)) ||
      cast.cast.embeds?.some((embed) =>
        unableToPromoteRegex.some((regex) => embed.url?.match(regex))
      ))
  ) {
    return {
      success: false,
    }
  }

  const children = await getPostChildren([data.hash])
  const hasFarcasterRelationship = children.some(
    (relationship) =>
      relationship.target === 'farcaster' &&
      relationship.target_account === fid?.toString()
  )
  const hasTwitterRelationship = children.some(
    (relationship) =>
      relationship.target === 'twitter' &&
      relationship.target_account === twitterConfig?.username
  )

  let hash: string | undefined
  let tweetId: string | undefined

  if (fid && !hasFarcasterRelationship) {
    const parentHash = cast.cast.parent_hash
    const channelId = cast.cast.channel?.id
    const embeds: string[] = []
    let quoteHash: string | undefined
    for (const embed of cast.cast.embeds || []) {
      if (embed.url) {
        embeds.push(embed.url)
      } else if (embed.cast) {
        quoteHash = embed.cast.hash
      }
    }

    const response = await neynar.createCast({
      fid,
      text: cast.cast.text,
      embeds,
      quote: quoteHash,
      parent: parentHash,
      channel: channelId,
    })
    if (response.success) {
      hash = response.cast.hash

      await createPost({
        hash,
        fid,
        data: post.data,
        reveal_hash: post.reveal_hash,
      })
      await createPostRelationship({
        post_hash: data.hash,
        target: 'farcaster',
        target_account: fid.toString(),
        target_id: hash,
      })
    } else {
      return { success: false }
    }
  }

  const isTweetable = !cast.cast.text.includes('@bankr')

  if (twitterConfig && !hasTwitterRelationship && isTweetable) {
    const twitter = new TwitterService(twitterConfig)
    const response = await twitter.promoteToTwitter(cast.cast, undefined, data.reply)
    if (response.tweetId) {
      tweetId = response.tweetId
      if (hash) {
        await createPostRelationship({
          post_hash: hash,
          target: 'twitter',
          target_account: twitterConfig.username,
          target_id: tweetId,
        })
      }
      await createPostRelationship({
        post_hash: data.hash,
        target: 'twitter',
        target_account: twitterConfig.username,
        target_id: tweetId,
      })
    }
  }

  return { success: true, hash, tweetId }
}

import { createElysia, encodeJson } from '../utils'
import { t } from 'elysia'
import { hashMessage, verifyMessage } from 'viem'
import { neynar } from '../services/neynar'
import {
  getAllFarcasterAccounts,
  getBulkPosts,
  getPost,
  getPostRelationships,
  revealPost,
} from '@anonworld/db'
import { Cast, ConversationCast } from '../services/neynar/types'
import { redis } from '../services/redis'
import { feed } from '../services/feed'

export const postsRoutes = createElysia({ prefix: '/posts' })
  .get(
    '/:hash',
    async ({ params, passkeyId }) => {
      let post: Cast | null = null
      const cached = await redis.getPost(params.hash)
      if (cached) {
        post = JSON.parse(cached)
      } else {
        post = await feed.getFeedPost(params.hash)
      }

      if (!post) {
        throw new Error('Post not found')
      }

      await redis.setPost(params.hash, JSON.stringify(post))

      if (passkeyId) {
        post = (await feed.addUserData(passkeyId, [post]))[0]
      }

      return post
    },
    {
      params: t.Object({
        hash: t.String(),
      }),
    }
  )
  .get(
    '/:hash/conversations',
    async ({ params }) => {
      const relationships = await getPostRelationships([params.hash])
      const hashes = [
        params.hash,
        ...relationships.filter((r) => r.target === 'farcaster').map((r) => r.target_id),
      ]
      const conversations = (
        await Promise.all(
          hashes.map(async (hash) => {
            const conversation = await neynar.getConversation(hash)
            return conversation.conversation.cast.direct_replies
          })
        )
      )
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const farcasterAccounts = await getAllFarcasterAccounts()
      const relevantHashes = getRelevantPosts(farcasterAccounts, conversations)
      const posts = await getBulkPosts(relevantHashes)
      const formattedPosts = await feed.getFeed(posts)

      return {
        data: formatConversations(conversations, formattedPosts),
      }
    },
    {
      params: t.Object({
        hash: t.String(),
      }),
    }
  )
  .post(
    '/reveal',
    async ({ body }) => {
      const post = await getPost(body.hash)
      if (!post) {
        throw new Error('Post not found')
      }

      const isValidSignature = await verifyMessage({
        message: body.message,
        signature: body.signature as `0x${string}`,
        address: body.address as `0x${string}`,
      })
      if (!isValidSignature) {
        return {
          success: false,
        }
      }

      const inputHash = hashMessage(encodeJson(post.data) + body.phrase)
      if (inputHash !== post.reveal_hash) {
        return {
          success: false,
        }
      }

      await revealPost(post.reveal_hash, {
        message: body.message,
        phrase: body.phrase,
        signature: body.signature,
        address: body.address,
      })

      return {
        success: true,
      }
    },
    {
      body: t.Object({
        hash: t.String(),
        message: t.String(),
        phrase: t.String(),
        signature: t.String(),
        address: t.String(),
      }),
    }
  )

const getRelevantPosts = (
  accounts: { fid: number }[],
  conversations: ConversationCast[]
): string[] => {
  const hashes: string[] = []

  const childConversations = conversations.flatMap((c) => c.direct_replies)
  if (childConversations.length > 0) {
    const childHashes = getRelevantPosts(accounts, childConversations)
    hashes.push(...childHashes)
  }

  const relevantConversations = conversations.filter((c) =>
    accounts.some((a) => a.fid === c.author.fid)
  )
  if (relevantConversations.length > 0) {
    const relevantHashes = relevantConversations.map((c) => c.hash)
    hashes.push(...relevantHashes)
  }

  return hashes
}

const formatConversations = (
  conversations: ConversationCast[],
  formattedPosts: Cast[]
) => {
  const formattedConversations: ConversationCast[] = []

  const copies: string[] = []
  for (const conversation of conversations) {
    const replies: ConversationCast[] = conversation.direct_replies

    const formattedPost = formattedPosts.find((p) => p.hash === conversation.hash)
    if (formattedPost?.relationships) {
      const hashes = formattedPost.relationships.map((r) => r.targetId)
      copies.push(...hashes)
      for (const hash of hashes) {
        const reply = conversations.find((c) => c.hash === hash)
        if (reply) {
          for (const r of reply.direct_replies) {
            if (!replies.some((rr) => rr.hash === r.hash)) {
              replies.push(r)
            }
          }
        }
      }
    }

    const formattedReplies = formatConversations(replies, formattedPosts)

    formattedConversations.push({
      ...formattedPost,
      ...conversation,
      direct_replies: formattedReplies,
    })
  }

  return formattedConversations
    .filter((c) => !copies.includes(c.hash))
    .sort(
      (a, b) =>
        (b.aggregate?.likes || b.reactions.likes_count) -
        (a.aggregate?.likes || a.reactions.likes_count)
    )
}

import { createElysia, encodeJson, formatHexId } from '../utils'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { neynar } from '../services/neynar'
import { Cast } from '../services/neynar/types'
import {
  getPostCredentials,
  getPostRelationships,
  getPosts,
  Post,
  getTokens,
  getFarcasterAccounts,
  getTwitterAccounts,
} from '@anonworld/db'

export const feedsRoutes = createElysia({ prefix: '/feeds' })
  .get(
    '/:fid/trending',
    async ({ params }) => {
      const cached = await redis.getTrendingFeed(params.fid)
      if (cached) {
        return { data: JSON.parse(cached) }
      }

      const posts = await getFormattedPosts(params.fid)
      const feed = await buildTrendingFeed(params.fid, posts)

      return { data: feed }
    },
    {
      params: t.Object({
        fid: t.Number(),
      }),
    }
  )
  .get(
    '/:fid/new',
    async ({ params, query }) => {
      const cached = await redis.getNewFeed(params.fid)
      if (cached) {
        return { data: JSON.parse(cached) }
      }

      const posts = await getFormattedPosts(params.fid)
      const feed = await buildNewFeed(params.fid, posts)

      return { data: feed }
    },
    {
      params: t.Object({ fid: t.Number() }),
      query: t.Object({ limit: t.Optional(t.Number()), offset: t.Optional(t.Number()) }),
    }
  )

const getFormattedPosts = async (fid: number) => {
  const posts = await getPosts(fid, {
    limit: 100,
    offset: 0,
  })

  if (posts.length === 0) return []

  const result = await formatPosts(posts)
  return result.filter((p) => !p.parent_hash)
}

const buildTrendingFeed = async (fid: number, posts: Array<Cast>) => {
  const now = Date.now()
  const feed = posts
    .sort((a, b) => {
      const aScore =
        (a.aggregate.likes || 0) /
        ((now - new Date(a.timestamp).getTime()) / 3600000 + 2) ** 1.5
      const bScore =
        (b.aggregate.likes || 0) /
        ((now - new Date(b.timestamp).getTime()) / 3600000 + 2) ** 1.5
      return bScore - aScore
    })
    .slice(0, 25)

  await redis.setTrendingFeed(fid, JSON.stringify(feed))
  return feed
}

const buildNewFeed = async (fid: number, posts: Array<Cast>) => {
  const feed = posts
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    .slice(0, 25)

  await redis.setNewFeed(fid, JSON.stringify(feed))
  return feed
}

export const buildFeeds = async (fid: number) => {
  const posts = await getFormattedPosts(fid)
  if (posts.length === 0) return
  await buildTrendingFeed(fid, posts)
  await buildNewFeed(fid, posts)
}

export async function formatPosts(posts: Array<Post>): Promise<Array<Cast>> {
  if (posts.length === 0) return []

  const [relationships, credentials] = await Promise.all([
    getPostRelationships(posts.map((p) => p.hash)),
    getPostCredentials(posts.map((p) => p.hash)),
  ])

  const tokenIds = [
    ...new Set(
      credentials
        .filter((c) => c.credential_instances.credential_id.startsWith('ERC20_BALANCE'))
        .map(
          (c) =>
            `${c.credential_instances.metadata.chainId}:${c.credential_instances.metadata.tokenAddress}`
        )
    ),
  ]
  const fids = [
    ...new Set(
      relationships
        .filter((r) => r.target === 'farcaster')
        .map((r) => Number(r.target_account))
    ),
  ]
  const usernames = [
    ...new Set(
      relationships.filter((r) => r.target === 'twitter').map((r) => r.target_account)
    ),
  ]

  const [tokens, farcasterAccounts, twitterAccounts] = await Promise.all([
    getTokens(tokenIds),
    getFarcasterAccounts(fids),
    getTwitterAccounts(usernames),
  ])

  const hashes = posts.map((p) => p.hash)
  for (const relationship of relationships) {
    if (relationship.target === 'farcaster') {
      hashes.push(relationship.target_id)
    }
  }

  const response = await neynar.getBulkCasts(hashes)

  const augmentedPosts: Array<any> = []
  for (const post of posts) {
    const postRelationships = relationships.filter((r) => r.post_hash === post.hash)
    const postCredentials = credentials.filter(
      (c) => c.post_credentials.post_hash === post.hash
    )

    const primaryCast = response.result.casts.find((cast) => cast.hash === post.hash)
    if (!primaryCast) continue

    const relatedCasts = response.result.casts.filter((cast) =>
      postRelationships.some((r) => r.target_id === cast.hash)
    )

    augmentedPosts.push({
      ...primaryCast,
      reveal: post.reveal_hash
        ? {
            ...(post.reveal_metadata || {}),
            revealHash: post.reveal_hash,
            input: encodeJson(post.data),
            revealedAt: post.updated_at.toISOString(),
          }
        : undefined,
      credentials: postCredentials.map((c) => ({
        ...c.credential_instances,
        displayId: formatHexId(c.credential_instances.id),
        token: tokens.find(
          (t) =>
            t.chain_id === Number(c.credential_instances.metadata.chainId) &&
            t.address.toLowerCase() ===
              c.credential_instances.metadata.tokenAddress.toLowerCase()
        ),
        id: undefined,
        proof: undefined,
      })),
      relationships: postRelationships.map((r) => ({
        target: r.target,
        targetAccount: r.target_account,
        targetId: r.target_id,
        twitter: twitterAccounts.find((t) => t.username === r.target_account)?.metadata,
        farcaster: farcasterAccounts.find((f) => f.fid === Number(r.target_account))
          ?.metadata,
      })),
      aggregate: {
        likes:
          primaryCast.reactions.likes_count +
          relatedCasts.reduce((acc, c) => acc + c.reactions.likes_count, 0),
        replies:
          primaryCast.replies.count +
          relatedCasts.reduce((acc, c) => acc + c.replies.count, 0),
      },
    })
  }

  return augmentedPosts
}

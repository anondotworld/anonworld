import { createElysia } from '../utils'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { db } from '@anonworld/common'
import { feed } from '../services/feed'
import { Post } from '@anonworld/common'

export const feedsRoutes = createElysia({ prefix: '/feeds' })
  .get(
    '/:fid/trending',
    async ({ params, passkeyId }) => {
      let posts: Array<Post> = []

      const cached = await redis.getTrendingFeed(params.fid)
      if (cached) {
        posts = JSON.parse(cached)
      } else {
        const response = await getFormattedPosts(params.fid)
        posts = await buildTrendingFeed(params.fid, response)
      }

      if (passkeyId) {
        posts = await feed.addUserData(passkeyId, posts)
      }

      return { data: posts }
    },
    {
      params: t.Object({
        fid: t.Number(),
      }),
    }
  )
  .get(
    '/:fid/new',
    async ({ params, passkeyId, query }) => {
      let posts: Array<Post> = []

      const cached = await redis.getNewFeed(params.fid)
      if (cached) {
        posts = JSON.parse(cached)
      } else {
        const response = await getFormattedPosts(params.fid)
        posts = await buildNewFeed(params.fid, response)
      }

      const page = query.page ?? 1
      const pageSize = 25
      const offset = (page - 1) * pageSize

      posts = posts.slice(offset, offset + pageSize)

      if (passkeyId) {
        posts = await feed.addUserData(passkeyId, posts)
      }

      return { data: posts }
    },
    {
      params: t.Object({ fid: t.Number() }),
      query: t.Object({ page: t.Optional(t.Number()) }),
    }
  )

const getFormattedPosts = async (fid: number) => {
  const response = await db.posts.getFeed(fid, {
    limit: 200,
    offset: 0,
  })

  if (response.length === 0) return []

  const posts = response.map((p) => p.parent_posts ?? p.posts)

  const result = await feed.getFeed(posts)
  return result.filter((p) => !p.parent_hash)
}

const buildTrendingFeed = async (fid: number, posts: Array<Post>) => {
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

const buildNewFeed = async (fid: number, posts: Array<Post>) => {
  const feed = posts
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    .slice(0, 200)

  await redis.setNewFeed(fid, JSON.stringify(feed))
  return feed
}

export const buildFeeds = async (fid: number) => {
  const posts = await getFormattedPosts(fid)
  if (posts.length === 0) return
  await buildTrendingFeed(fid, posts)
  await buildNewFeed(fid, posts)
  await redis.setPosts(posts)
}

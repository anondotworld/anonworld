import { Redis } from 'ioredis'
import { createElysia } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { Cast } from '../services/types'
import { getPostMappings } from '@anon/db'

const redis = new Redis(process.env.REDIS_URL as string)

export async function augmentCasts(casts: Cast[]) {
  const hashes = casts.map((cast) => cast.hash)
  const [mappings] = await Promise.all([getPostMappings(hashes)])

  return casts.map((cast) => {
    const mapping = mappings.find((m) => m.castHash === cast.hash)
    if (mapping) {
      return { ...cast, tweetId: mapping.tweetId }
    }
    return cast
  })
}

export const feedRoutes = createElysia({ prefix: '/feed' })
  .get(
    '/:tokenAddress/new',
    async ({ params }) => {
      const cached = await redis.get(`new:${params.tokenAddress}`)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await neynar.getUserCasts(TOKEN_CONFIG[params.tokenAddress].fid)
      await redis.set(`new:${params.tokenAddress}`, JSON.stringify(response), 'EX', 30)
      return {
        casts: await augmentCasts(response.casts),
      }
    },
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )
  .get(
    '/:tokenAddress/trending',
    async ({ params }) => {
      const trending = await redis.get(`trending:${params.tokenAddress}`)
      if (!trending) {
        return {
          casts: [],
        }
      }

      const castsWithScores: [string, number][] = JSON.parse(trending)
      const hashes = castsWithScores.map((cast) => cast[0])
      const response = await neynar.getBulkCasts(hashes)

      return {
        casts: await augmentCasts(response.result.casts),
      }
    },
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )

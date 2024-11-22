import { Redis } from 'ioredis'
import { createElysia } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { Cast, GetCastsResponse } from '../services/types'
import { getPostReveals } from '@anon/db'

const redis = new Redis(process.env.REDIS_URL as string)

export async function addRevealToCasts(casts: Cast[]) {
  const hashes = casts.map((cast) => cast.hash)
  const reveals = await getPostReveals(hashes)
  return casts.map((cast) => {
    const reveal = reveals.find(
      (reveal) =>
        reveal.revealHash &&
        reveal.castHash === cast.hash &&
        BigInt(reveal.revealHash) != BigInt(0)
    )
    if (!reveal) {
      return cast
    }

    return {
      ...cast,
      reveal: {
        ...reveal,
        input: {
          text: cast.text,
          embeds: cast.embeds.filter((embed) => embed.url).map((embed) => embed.url),
          quote: cast.embeds.find((e) => e.cast)?.cast?.hash ?? null,
          channel: cast.channel?.id ?? null,
          parent: cast.parent_hash ?? null,
        },
      },
    }
  })
}

export const feedRoutes = createElysia({ prefix: '/feed' })
  .get(
    '/:tokenAddress/new',
    async ({ params }) => {
      let response: GetCastsResponse
      const cached = await redis.get(`new:${params.tokenAddress}`)
      if (cached) {
        response = JSON.parse(cached)
      } else {
        response = await neynar.getUserCasts(TOKEN_CONFIG[params.tokenAddress].fid)
        await redis.set(`new:${params.tokenAddress}`, JSON.stringify(response), 'EX', 30)
      }

      return {
        casts: await addRevealToCasts(response.casts),
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
        casts: await addRevealToCasts(response.result.casts),
      }
    },
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )

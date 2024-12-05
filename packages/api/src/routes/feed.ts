import { Redis } from 'ioredis'
import { BEST_OF_FID, createElysia, FID, LAUNCH_FID } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { Cast, GetCastsResponse } from '../services/types'
import { getPostMappings, getPostReveals } from '@anon/db'

const redis = new Redis(process.env.REDIS_URL as string)

export async function augmentCasts(casts: Cast[]) {
  const hashes = casts.map((cast) => cast.hash)
  const [reveals, mappings] = await Promise.all([
    getPostReveals(hashes),
    getPostMappings(hashes),
  ])

  return casts
    .map((cast) => {
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
    .map((cast) => {
      const mapping = mappings.find((m) => m.castHash === cast.hash)
      if (mapping) {
        return { ...cast, tweetId: mapping.tweetId, launchHash: mapping.launchHash }
      }
      return cast
    })
}

export const feedRoutes = createElysia({ prefix: '/feed' })
  .get(
    '/:tokenAddress/new',
    async ({ params }) => {
      let response: GetCastsResponse
      const cached = await redis.get(`new:${FID}`)
      if (cached) {
        response = JSON.parse(cached)
      } else {
        response = await neynar.getUserCasts(FID)
        await redis.set(`new:${FID}`, JSON.stringify(response), 'EX', 30)
      }

      return {
        casts: await augmentCasts(
          response.casts.filter(({ text }) => !text.toLowerCase().includes('@clanker'))
        ),
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
      const cached = null
      if (cached) {
        return {
          casts: await augmentCasts(JSON.parse(cached)),
        }
      }

      const trending = await redis.get(`trending:${BEST_OF_FID}`)
      if (!trending) {
        return {
          casts: [],
        }
      }

      const castsWithScores: [string, number][] = JSON.parse(trending)
      const hashes = castsWithScores.map((cast) => cast[0])
      const response = await neynar.getBulkCasts(hashes)

      await redis.set(
        `trending:data:${BEST_OF_FID}`,
        JSON.stringify(response.result.casts),
        'EX',
        30
      )

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
  .get(
    '/:tokenAddress/launches/new',
    async ({ params }) => {
      let response: Cast[]
      const cached = await redis.get(`launches:new:${params.tokenAddress}`)
      if (cached) {
        response = JSON.parse(cached)
      } else {
        const [searchResponse1, searchResponse2] = await Promise.all([
          neynar.getUserCasts(FID),
          neynar.getUserCasts(BEST_OF_FID),
        ])
        response = searchResponse1.casts
          .concat(searchResponse2.casts)
          .sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .filter(({ text }) => text.toLowerCase().includes('@clanker'))
        if (response.length === 0) {
          return {
            casts: [],
          }
        }

        await redis.set(
          `launches:new:${params.tokenAddress}`,
          JSON.stringify(response),
          'EX',
          30
        )
      }

      return {
        casts: await augmentCasts(response),
      }
    },
    {
      params: t.Object({
        tokenAddress: t.String(),
      }),
    }
  )
  .get(
    '/:tokenAddress/launches/promoted',
    async ({ params }) => {
      let response: GetCastsResponse
      const cached = await redis.get(`launches:promoted:${params.tokenAddress}`)
      if (cached) {
        response = JSON.parse(cached)
      } else {
        response = await neynar.getUserCasts(LAUNCH_FID)
        await redis.set(
          `launches:promoted:${params.tokenAddress}`,
          JSON.stringify(response),
          'EX',
          30
        )
      }

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

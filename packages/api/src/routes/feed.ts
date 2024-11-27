import { Redis } from 'ioredis'
import { createElysia } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { Cast, GetBulkCastsResponse, GetCastsResponse } from '../services/types'
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
      const fid = TOKEN_CONFIG[params.tokenAddress].fid
      const cached = await redis.get(`new:${fid}`)
      if (cached) {
        response = JSON.parse(cached)
      } else {
        response = await neynar.getUserCasts(fid)
        await redis.set(`new:${fid}`, JSON.stringify(response), 'EX', 30)
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
  .get(
    '/:tokenAddress/trending',
    async ({ params }) => {
      const fid = TOKEN_CONFIG[params.tokenAddress].bestOfFid
      const trending = await redis.get(`trending:${fid}`)
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
  .get(
    '/:tokenAddress/launches/new',
    async ({ params }) => {
      let response: Cast[]
      const cached = null
      if (cached) {
        response = JSON.parse(cached)
      } else {
        const searchResponse = await neynar.getUserCasts(
          TOKEN_CONFIG[params.tokenAddress].fid
        )
        if (searchResponse.casts.length === 0) {
          return {
            casts: [],
          }
        }

        response = searchResponse.casts.filter(({ text }) =>
          text.toLowerCase().includes('@clanker')
        )
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
        response = await neynar.getUserCasts(TOKEN_CONFIG[params.tokenAddress].launchFid)
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

import { Redis } from 'ioredis'
import { BEST_OF_FID, createElysia, FID, LAUNCH_FID } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { Cast, GetCastsResponse } from '../services/types'
import { AnonWorldSDK } from '@anonworld/sdk'

const redis = new Redis(process.env.REDIS_URL as string)
const sdk = new AnonWorldSDK(process.env.NEXT_PUBLIC_ANONWORLD_API_URL as string)

export async function augmentCasts(casts: Cast[]) {
  const hashes = casts.map((cast) => cast.hash)
  const metadata = await sdk.getBulkPostMetadata(hashes)

  return casts.map((cast) => {
    let revealHash = null
    let revealMetadata = null
    let tweetId = null
    let promotedHash = null
    let launchHash = null

    const castMetadata = metadata.data?.data.find((m) => m.hash === cast.hash)
    if (castMetadata) {
      revealHash = castMetadata.revealHash
      revealMetadata = castMetadata.revealMetadata
      tweetId = castMetadata.relationships.find((r) => r.target === 'twitter')?.targetId
      promotedHash = castMetadata.relationships.find(
        (r) => r.target === 'farcaster' && Number(r.targetAccount) === BEST_OF_FID
      )?.targetId
      launchHash = castMetadata.relationships.find(
        (r) => r.target === 'farcaster' && Number(r.targetAccount) === LAUNCH_FID
      )?.targetId
    }

    return {
      ...cast,
      reveal: {
        revealHash,
        ...revealMetadata,
      },
      tweetId,
      promotedHash,
      launchHash,
    }
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
      const cached = await redis.get(`trending:data:${BEST_OF_FID}`)
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

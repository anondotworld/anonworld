import { createElysia } from '../utils'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { simplehash } from '../services/simplehash'

export const nftRoutes = createElysia({ prefix: '/nfts' }).get(
  '/collections/:chainId/:tokenAddress',
  async ({ params }) => {
    const cached = await redis.getNFTCollection(params.chainId, params.tokenAddress)
    if (cached) {
      return JSON.parse(cached)
    }

    const collection = await simplehash.getNFTCollection(
      params.chainId,
      params.tokenAddress
    )

    if (!collection) {
      return null
    }

    await redis.setNFTCollection(
      params.chainId,
      params.tokenAddress,
      JSON.stringify(collection)
    )

    return collection
  },
  {
    params: t.Object({
      chainId: t.Number(),
      tokenAddress: t.String(),
    }),
  }
)

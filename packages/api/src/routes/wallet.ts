import { createElysia } from '../utils'
import { t } from 'elysia'
import { zerion } from '../services/zerion'
import { simplehash } from '../services/simplehash'
import { getZerionChain } from '@anonworld/common'
import { db } from '../db'

export const walletRoutes = createElysia({ prefix: '/wallet' })
  .get(
    '/:address/fungibles',
    async ({ params }) => {
      const data = await zerion.getFungiblePositions(params.address)

      const tokenIds = data.map((t) => {
        const chain = getZerionChain(t.relationships.chain.data.id)
        const impl = t.attributes.fungible_info.implementations.find(
          (i) => i.chain_id === chain.zerionId
        )
        return `${chain.id}:${impl?.address}`
      })

      const knownTokens = await db.tokens.getClankerTokens(tokenIds)

      return {
        data: data.map((t) => {
          const chain = getZerionChain(t.relationships.chain.data.id)
          const impl = t.attributes.fungible_info.implementations.find(
            (i) => i.chain_id === chain.zerionId
          )

          const knownToken = knownTokens[`${chain.id}:${impl?.address}`]
          if (!knownToken) return t

          return {
            ...t,
            attributes: {
              ...t.attributes,
              value: t.attributes.value ?? knownToken.price_usd ?? 0,
              fungible_info: {
                ...t.attributes.fungible_info,
                icon: {
                  url: knownToken.image_url,
                },
              },
            },
          }
        }),
      }
    },
    {
      params: t.Object({
        address: t.String(),
      }),
    }
  )
  .get(
    '/:address/nfts',
    async ({ params }) => {
      const data = await simplehash.getNFTsForWallet(params.address)
      return { data: data.nfts }
    },
    {
      params: t.Object({
        address: t.String(),
      }),
    }
  )

import { createElysia } from '../utils'
import { t } from 'elysia'
import { zerion } from '../services/zerion'
import { simplehash } from '../services/simplehash'

export const walletRoutes = createElysia({ prefix: '/wallet' })
  .get(
    '/:address/fungibles',
    async ({ params }) => {
      const data = await zerion.getFungiblePositions(params.address)
      return { data }
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

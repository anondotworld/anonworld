import { createElysia } from '../utils'
import { zeroAddress } from 'viem'
import { t } from 'elysia'
import { createClientV2 } from '@0x/swap-ts-sdk'
import { tokens } from '../services/tokens'

const zeroExClient = createClientV2({
  apiKey: process.env.ZERO_EX_API_KEY!,
})

export const tokenRoutes = createElysia({ prefix: '/tokens' })
  .get(
    '/:chainId/:tokenAddress',
    async ({ params }) => {
      return await tokens.getOrCreateERC20(params.chainId, params.tokenAddress)
    },
    {
      params: t.Object({
        chainId: t.Number(),
        tokenAddress: t.String(),
      }),
    }
  )
  .post(
    '/swap/quote',
    async ({ body }) => {
      const quote = await zeroExClient.swap.permit2.getQuote.query({
        chainId: body.chainId,
        taker: body.taker,
        buyToken:
          body.buyToken === zeroAddress
            ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
            : body.buyToken,
        sellToken:
          body.sellToken === zeroAddress
            ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
            : body.sellToken,
        sellAmount: body.sellAmount,
      })
      return quote
    },
    {
      body: t.Object({
        chainId: t.Number(),
        taker: t.String(),
        buyToken: t.String(),
        sellToken: t.String(),
        sellAmount: t.String(),
      }),
    }
  )

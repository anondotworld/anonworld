import { createElysia } from '../utils'
import {
  concat,
  createPublicClient,
  hexToBigInt,
  http,
  keccak256,
  pad,
  toHex,
  zeroAddress,
} from 'viem'
import { base } from 'viem/chains'
import { simplehash } from '../services/simplehash'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { zerion } from '../services/zerion'
import { createClientV2 } from '@0x/swap-ts-sdk'
import { db } from '../db'

const zeroExClient = createClientV2({
  apiKey: process.env.ZERO_EX_API_KEY!,
})

const client = createPublicClient({
  chain: base,
  transport: http(),
})

export const tokenRoutes = createElysia({ prefix: '/tokens' })
  .get(
    '/:chainId/:tokenAddress',
    async ({ params }) => {
      return await getOrCreateToken(params.chainId, params.tokenAddress)
    },
    {
      params: t.Object({
        chainId: t.Number(),
        tokenAddress: t.String(),
      }),
    }
  )
  .get(
    '/:chainId/:tokenAddress/balance-slot',
    async ({ params, error }) => {
      const chainId = params.chainId
      const tokenAddress = params.tokenAddress

      const slot = await redis.getBalanceStorageSlot(chainId, tokenAddress)
      if (slot) return { slot: Number(slot) }

      const topHolder = await simplehash.getTopHolder(chainId, tokenAddress)

      for (let slot = 0; slot < 10; slot++) {
        const storageKey = keccak256(concat([pad(topHolder.address), pad(toHex(slot))]))
        const data = await client.getStorageAt({
          address: tokenAddress as `0x${string}`,
          slot: storageKey,
        })
        if (data && hexToBigInt(data) === topHolder.balance) {
          await redis.setBalanceStorageSlot(chainId, tokenAddress, slot)
          await getOrCreateToken(chainId, tokenAddress)
          await db.tokens.update(`${chainId}:${tokenAddress}`, {
            balance_slot: slot,
          })
          return { slot }
        }
      }

      return error(404, 'Failed to find balance storage slot')
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
    async ({ body, error }) => {
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

export const getOrCreateToken = async (chainId: number, tokenAddress: string) => {
  const token = await redis.getToken(chainId, tokenAddress)
  if (token) return JSON.parse(token)
  return syncToken(chainId, tokenAddress)
}

export const syncToken = async (chainId: number, tokenAddress: string) => {
  const zerionToken = await zerion.getFungible(chainId, tokenAddress)
  const simpleHashToken = await simplehash.getFungible(chainId, tokenAddress)

  const id = `${chainId}:${tokenAddress}`
  const token = await db.tokens.get(id)
  if (token) {
    const fields = {
      price_usd: zerionToken.attributes.market_data.price?.toFixed(8) ?? 0,
      market_cap: Math.round(zerionToken.attributes.market_data.market_cap ?? 0),
      total_supply: Math.round(zerionToken.attributes.market_data.total_supply ?? 0),
      holders: simpleHashToken.holder_count ?? 0,
    }
    await db.tokens.update(id, fields)
    await redis.setToken(
      chainId,
      tokenAddress,
      JSON.stringify({
        ...token,
        ...fields,
      })
    )
  } else {
    const impl = zerionToken.relationships.chain
      ? zerionToken.attributes.implementations.find(
          (i) =>
            i.chain_id === zerionToken.relationships.chain.data.id &&
            i.address === tokenAddress
        )
      : zerionToken.attributes.implementations[0]

    const token = {
      id,
      chain_id: chainId,
      address: tokenAddress,
      symbol: zerionToken.attributes.symbol,
      name: zerionToken.attributes.name,
      decimals: impl?.decimals ?? simpleHashToken?.decimals ?? 18,
      image_url: zerionToken.attributes.icon?.url,
      price_usd: zerionToken.attributes.market_data.price?.toFixed(8) ?? 0,
      market_cap: Math.round(zerionToken.attributes.market_data.market_cap ?? 0),
      total_supply: Math.round(zerionToken.attributes.market_data.total_supply ?? 0),
      holders: simpleHashToken?.holder_count ?? 0,
    }
    await db.tokens.create(token)
    await redis.setToken(chainId, tokenAddress, JSON.stringify(token))
  }
}

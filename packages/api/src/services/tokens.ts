import { ContractType } from '@anonworld/common'
import { db } from '../db'
import { DBToken } from '../db/types'
import { redis } from './redis'
import { simplehash } from './simplehash'
import { zerion } from './zerion'

class TokensService {
  async getOrCreateERC20(chainId: number, tokenAddress: string) {
    const token = await redis.getToken(chainId, tokenAddress)
    if (token) return JSON.parse(token)
    return this.syncERC20(chainId, tokenAddress)
  }

  async syncERC20(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const token = await db.tokens.get(id)
    if (token) {
      if (token.type === ContractType.ERC721) {
        await this.updateERC721(token)
      } else {
        await this.updateERC20(token)
      }
    } else {
      await this.createERC20(chainId, tokenAddress)
    }
  }

  async updateERC20(token: DBToken) {
    const zerionToken = await zerion.getFungible(token.chain_id, token.address)
    const simpleHashToken = await simplehash.getToken(token.chain_id, token.address)

    const fields = {
      price_usd: zerionToken.attributes.market_data.price?.toFixed(8) ?? 0,
      market_cap: Math.round(zerionToken.attributes.market_data.market_cap ?? 0),
      total_supply: Math.round(zerionToken.attributes.market_data.total_supply ?? 0),
      holders: simpleHashToken.holder_count ?? 0,
    }
    await db.tokens.update(token.id, fields)

    const result = {
      ...token,
      ...fields,
    }
    await redis.setToken(token.chain_id, token.address, JSON.stringify(result))

    return result
  }

  async createERC20(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const zerionToken = await zerion.getFungible(chainId, tokenAddress)
    const simpleHashToken = await simplehash.getToken(chainId, tokenAddress)

    const impl = zerionToken.relationships.chain
      ? zerionToken.attributes.implementations.find(
          (i) =>
            i.chain_id === zerionToken.relationships.chain.data.id &&
            i.address === tokenAddress
        )
      : zerionToken.attributes.implementations[0]

    const token = {
      id: id.toLowerCase(),
      chain_id: chainId,
      address: tokenAddress.toLowerCase(),
      symbol: zerionToken.attributes.symbol,
      name: zerionToken.attributes.name,
      decimals: impl?.decimals ?? simpleHashToken?.decimals ?? 18,
      image_url: zerionToken.attributes.icon?.url,
      price_usd: zerionToken.attributes.market_data.price?.toFixed(8) ?? 0,
      market_cap: Math.round(zerionToken.attributes.market_data.market_cap ?? 0),
      total_supply: Math.round(zerionToken.attributes.market_data.total_supply ?? 0),
      holders: simpleHashToken?.holder_count ?? 0,
      type: 'ERC20',
    }
    await db.tokens.create(token)
    await redis.setToken(chainId, tokenAddress, JSON.stringify(token))

    return token
  }

  async getOrCreateERC721(chainId: number, tokenAddress: string) {
    const token = await redis.getToken(chainId, tokenAddress)
    if (token) return JSON.parse(token)
    return this.syncERC721(chainId, tokenAddress)
  }

  async syncERC721(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const token = await db.tokens.get(id)
    if (token) {
      await this.updateERC721(token)
    } else {
      await this.createERC721(chainId, tokenAddress)
    }
  }

  async updateERC721(token: DBToken) {
    const collection = await simplehash.getNFTCollection(token.chain_id, token.address)
    if (!collection) return

    let floorPrice = 0
    if (collection.floor_prices && collection.floor_prices.length > 0) {
      floorPrice = Math.min(
        ...collection.floor_prices.map((fp) => fp.value_usd_cents / 100)
      )
    }

    const fields = {
      name: collection.name,
      image_url: collection.image_url,
      price_usd: floorPrice.toFixed(8),
      market_cap: Math.round(floorPrice * collection.distinct_nft_count),
      holders: collection.distinct_owner_count,
      total_supply: collection.distinct_nft_count,
    }
    await db.tokens.update(token.id, fields)

    const result = {
      ...token,
      ...fields,
    }

    await redis.setToken(token.chain_id, token.address, JSON.stringify(result))

    return result
  }

  async createERC721(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const collection = await simplehash.getNFTCollection(chainId, tokenAddress)
    if (!collection) return

    let floorPrice = 0
    if (collection.floor_prices && collection.floor_prices.length > 0) {
      floorPrice = Math.min(
        ...collection.floor_prices.map((fp) => fp.value_usd_cents / 100)
      )
    }

    const token = {
      id: id.toLowerCase(),
      chain_id: chainId,
      address: tokenAddress.toLowerCase(),
      symbol: collection.top_contract_details[0]?.symbol ?? '',
      name: collection.name,
      decimals: 0,
      image_url: collection.image_url,
      price_usd: floorPrice.toFixed(8),
      market_cap: Math.round(floorPrice * collection.distinct_nft_count),
      total_supply: collection.distinct_nft_count,
      holders: collection.distinct_owner_count,
      type: 'ERC721',
    }
    await db.tokens.create(token)
    await redis.setToken(chainId, tokenAddress, JSON.stringify(token))

    return token
  }
}

export const tokens = new TokensService()

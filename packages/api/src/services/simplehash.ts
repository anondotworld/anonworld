import { chains, getChain, SimplehashNFT } from '@anonworld/common'

const simplehashChains = chains.map((chain) => chain.simplehashId).filter((id) => id)

class SimplehashService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.simplehash.com/api/v0'
  private static instance: SimplehashService

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  static getInstance(): SimplehashService {
    if (!SimplehashService.instance) {
      const apiKey = process.env.SIMPLEHASH_API_KEY
      if (!apiKey) {
        throw new Error('SIMPLEHASH_API_KEY environment variable is not set')
      }
      SimplehashService.instance = new SimplehashService(apiKey)
    }
    return SimplehashService.instance
  }

  private async makeRequest<T>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'DELETE'
      maxRetries?: number
      body?: string
    }
  ): Promise<T> {
    const { maxRetries = 5, method, body } = options ?? {}
    let retries = 0

    let response: Response | undefined

    while (retries < maxRetries) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': this.apiKey,
      }

      response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        method,
        body,
      })

      if (response.ok) {
        return response.json()
      }

      retries++
      const delay = Number.parseInt(response?.headers.get('Retry-After') ?? '5')
      await new Promise((resolve) => setTimeout(resolve, delay * 1000))
    }

    if (response) {
      console.error(await response.text())
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    throw new Error('Maximum retries reached while waiting for data')
  }

  async getTopNFTHolder(chainId: number, tokenAddress: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/nfts/top_collectors/${chain.simplehashId}/${tokenAddress}?limit=1`
    const response = await this.makeRequest<{
      top_collectors: { owner_address: `0x${string}`; distinct_nfts_owned: number }[]
    }>(url)

    const owner = response.top_collectors[0]

    return {
      address: owner.owner_address,
      balance: BigInt(owner.distinct_nfts_owned),
    }
  }

  async getTopTokenHolder(chainId: number, tokenAddress: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/fungibles/top_wallets?fungible_id=${chain.simplehashId}.${tokenAddress}&limit=1`
    const response = await this.makeRequest<{
      owners: { owner_address: `0x${string}`; quantity_string: string }[]
    }>(url)

    const owner = response.owners[0]

    return {
      address: owner.owner_address,
      balance: BigInt(owner.quantity_string),
    }
  }

  async getTopWalletsForToken(chainId: number, tokenAddress: string, cursor?: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/fungibles/top_wallets?fungible_id=${chain.simplehashId}.${tokenAddress}${cursor ? `&cursor=${cursor}` : ''}`
    return await this.makeRequest<{
      owners: { owner_address: `0x${string}`; quantity_string: string }[]
      next_cursor: string
    }>(url)
  }

  async getToken(chainId: number, tokenAddress: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/fungibles/assets?fungible_ids=${chain.simplehashId}.${tokenAddress}&include_prices=1`
    return await this.makeRequest<{ holder_count: number; decimals: number }>(url)
  }

  async getNFTCollection(chainId: number, tokenAddress: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/nfts/collections/${chain.simplehashId}/${tokenAddress}?include_top_contract_details=1`
    const response = await this.makeRequest<{
      collections: {
        name: string
        image_url: string
        distinct_owner_count: number
        distinct_nft_count: number
        top_contract_details: {
          symbol: string
        }[]
        floor_prices: {
          value_usd_cents: number
        }[]
      }[]
    }>(url)

    return response.collections[0]
  }

  async getNFTsForWallet(address: string) {
    const url = `/nfts/owners_v2?chains=${simplehashChains.join(',')}&wallet_addresses=${address}&order_by=floor_price__desc`
    return await this.makeRequest<{
      next_cursor: string | null
      next: string | null
      previous: string | null
      nfts: SimplehashNFT[]
    }>(url)
  }
}

export const simplehash = SimplehashService.getInstance()

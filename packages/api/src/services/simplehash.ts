import { getChain } from '@anonworld/common'

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

  async getTopHolder(chainId: number, tokenAddress: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/fungibles/top_wallets?fungible_id=${chain.simplehashId}.${tokenAddress}&limit=1`
    const response = await this.makeRequest<{
      owners: { owner_address: `0x${string}`; quantity_string: string }[]
      next_cursor: string
    }>(url)

    const owner = response.owners[0]

    return {
      address: owner.owner_address,
      balance: BigInt(owner.quantity_string),
    }
  }

  async getTopWalletsForFungible(chainId: number, tokenAddress: string, cursor?: string) {
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

  async getFungible(chainId: number, tokenAddress: string) {
    const chain = getChain(chainId)
    if (!chain.simplehashId) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/fungibles/assets?fungible_ids=${chain.simplehashId}.${tokenAddress}&include_prices=1`
    return await this.makeRequest<{ holder_count: number; decimals: number }>(url)
  }
}

export const simplehash = SimplehashService.getInstance()

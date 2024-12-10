const CHAIN_ID_TO_SIMPLEHASH_CHAIN_ID: Record<number, string> = {
  8453: 'base',
}

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

  async getTopWalletsForFungible(chainId: number, tokenAddress: string, cursor?: string) {
    const chain = CHAIN_ID_TO_SIMPLEHASH_CHAIN_ID[chainId]
    if (!chain) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    const url = `/fungibles/top_wallets?fungible_id=${chain}.${tokenAddress}${cursor ? `&cursor=${cursor}` : ''}`
    return await this.makeRequest<{
      owners: { owner_address: `0x${string}`; quantity_string: string }[]
      next_cursor: string
    }>(url)
  }

  async getTokenOwners({
    chainId,
    tokenAddress,
    minBalance,
  }: { chainId: number; tokenAddress: string; minBalance: bigint }) {
    const owners: `0x${string}`[] = []

    let cursor = ''
    while (true) {
      const data = await this.getTopWalletsForFungible(chainId, tokenAddress, cursor)

      for (const owner of data.owners) {
        if (BigInt(owner.quantity_string) >= minBalance) {
          owners.push(owner.owner_address.toLowerCase() as `0x${string}`)
        } else {
          return owners
        }
      }

      if (!data.next_cursor) break
      cursor = data.next_cursor
    }

    return owners
  }
}

export const simplehash = SimplehashService.getInstance()

import {
  Action,
  ApiResponse,
  Community,
  ContractType,
  ConversationPost,
  Credential,
  CredentialWithId,
  ExecuteAction,
  FarcasterChannel,
  FarcasterUser,
  FungiblePosition,
  NFTPosition,
  Post,
  RequestConfig,
  RevealArgs,
  SimplehashNFT,
  SimplehashNFTCollection,
  StorageType,
  SwapQuote,
  SwapQuoteError,
  Token,
  UploadImageResponse,
  Vault,
} from '@anonworld/common'

export class AnonWorldSDK {
  private apiUrl: string
  private token: string | null

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || 'https://api.anon.world'
  }

  public setToken(token: string) {
    this.token = token
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    const hasJson = contentType?.includes('application/json')
    const data = hasJson ? await response.json() : null

    if (!response.ok) {
      return {
        error: {
          message:
            data?.message ||
            data?.error ||
            `API error: ${response.status} ${response.statusText}`,
          status: response.status,
        },
      }
    }

    return { data }
  }

  public async request<T>(
    endpoint: string,
    config: RequestConfig & { maxRetries?: number } = {}
  ): Promise<ApiResponse<T>> {
    const { headers = {}, maxRetries = 1, isFormData = false, ...options } = config

    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
    }

    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json'
    }

    const finalHeaders = {
      ...defaultHeaders,
      ...headers,
    }

    if (this.token) {
      finalHeaders.Authorization = `Bearer ${this.token}`
    }

    let attempt = 1
    while (true) {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: finalHeaders,
      })

      if (!response.ok && attempt < maxRetries) {
        attempt++
        continue
      }

      const result = await this.handleResponse<T>(response)

      return result
    }
  }

  async executeActions(actions: ExecuteAction[]) {
    return await this.request<{
      results: { success: boolean; hash?: string; tweetId?: string }[]
    }>('/actions/execute', {
      method: 'POST',
      body: JSON.stringify({
        actions,
      }),
      maxRetries: 3,
    })
  }

  async revealPost(args: RevealArgs) {
    return await this.request<{ success: boolean; hash?: string }>('/posts/reveal', {
      method: 'POST',
      body: JSON.stringify(args),
    })
  }

  async getTrendingFeed(fid: number) {
    return await this.request<{ data: Array<Post> }>(`/feeds/${fid}/trending`)
  }

  async getNewFeed(fid: number, page = 1) {
    return await this.request<{ data: Array<Post> }>(`/feeds/${fid}/new?page=${page}`)
  }

  async getPost(hash: string) {
    return await this.request<Post>(`/posts/${hash}`)
  }

  async getPostConversations(hash: string) {
    return await this.request<{ data: Array<ConversationPost> }>(
      `/posts/${hash}/conversations`
    )
  }

  async getFarcasterCast(identifier: string) {
    return await this.request<Post>(`/farcaster/casts?identifier=${identifier}`)
  }

  async getFarcasterIdentity(address: string) {
    return await this.request<FarcasterUser>(`/farcaster/identities?address=${address}`)
  }

  async getFarcasterUser(fid: number) {
    return await this.request<FarcasterUser>(`/farcaster/users/${fid}`)
  }

  async getFarcasterChannel(channelId: string) {
    return await this.request<FarcasterChannel>(`/farcaster/channels/${channelId}`)
  }

  async uploadImage(image: File) {
    const formData = new FormData()
    formData.append('image', image)

    return await this.request<UploadImageResponse>('/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  }

  async getAction(actionId: string) {
    return await this.request<Action>(`/actions/${actionId}`)
  }

  async getActions() {
    return await this.request<{ data: Action[] }>('/actions')
  }

  async createCredential({
    proof,
    publicInputs,
    parentId,
    type,
    version,
  }: {
    proof: number[]
    publicInputs: string[]
    parentId?: string
    type: string
    version: string
  }) {
    return await this.request<CredentialWithId>('/credentials', {
      method: 'POST',
      body: JSON.stringify({ proof, publicInputs, parentId, type, version }),
    })
  }

  async getCredential(id: string) {
    return await this.request<Credential>(`/credentials/${id}`)
  }

  async getWalletFungibles(address: string) {
    return await this.request<{ data: FungiblePosition[] }>(
      `/wallet/${address}/fungibles`
    )
  }

  async getWalletNFTs(address: string) {
    return await this.request<{ data: SimplehashNFT[] }>(`/wallet/${address}/nfts`)
  }

  async getToken(chainId: number, tokenAddress: string) {
    return await this.request<Token>(`/tokens/${chainId}/${tokenAddress}`)
  }

  async getStorageSlot(
    chainId: number,
    contractAddress: string,
    contractType: ContractType,
    storageType: StorageType
  ) {
    return await this.request<{ slot: number }>(`/evm/storage-slot`, {
      method: 'POST',
      body: JSON.stringify({
        chainId,
        contractAddress,
        contractType,
        storageType,
      }),
    })
  }

  async getCommunities() {
    return await this.request<{ data: Community[] }>('/communities')
  }

  async getCommunity(id: string) {
    return await this.request<Community>(`/communities/${id}`)
  }

  async getSwapQuote(args: {
    chainId: number
    taker: string
    buyToken: string
    sellToken: string
    sellAmount: string
  }) {
    return await this.request<{ data: SwapQuote | SwapQuoteError }>('/swap/quote', {
      method: 'POST',
      body: JSON.stringify(args),
    })
  }

  async getPasskeyChallenge(nonce: string) {
    return await this.request<{ challenge: `0x${string}` }>(`/auth/challenge`, {
      method: 'POST',
      body: JSON.stringify({ nonce }),
    })
  }

  async createPasskey(args: {
    nonce: string
    id: string
    publicKey: {
      prefix: number
      x: string
      y: string
    }
  }) {
    return await this.request<{ success: boolean; token: string }>(`/auth/create`, {
      method: 'POST',
      body: JSON.stringify(args),
    })
  }

  async authenticatePasskey(args: {
    nonce: string
    raw: {
      id: string
      type: string
    }
    signature: {
      r: string
      s: string
      yParity?: number
    }
    metadata: any
  }) {
    return await this.request<{ success: boolean; token: string }>(`/auth/authenticate`, {
      method: 'POST',
      body: JSON.stringify(args),
    })
  }
  async addToVault(vaultId: string, credentialId: string) {
    return await this.request<{ success: boolean }>(`/vaults/${vaultId}/credentials`, {
      method: 'PUT',
      body: JSON.stringify({ credentialId }),
    })
  }

  async removeFromVault(vaultId: string, credentialId: string) {
    return await this.request<{ success: boolean }>(`/vaults/${vaultId}/credentials`, {
      method: 'DELETE',
      body: JSON.stringify({ credentialId }),
    })
  }

  async getVault(vaultId: string) {
    return await this.request<Vault>(`/vaults/${vaultId}`)
  }

  async getVaultPosts(vaultId: string) {
    return await this.request<{ data: Array<Post> }>(`/vaults/${vaultId}/posts`)
  }

  async getVaults() {
    if (!this.token) {
      return { error: { message: 'No token', status: 401 } }
    }
    return await this.request<{ data: Vault[] }>(`/auth/vaults`)
  }

  async likePost(hash: string) {
    if (!this.token) {
      return { error: { message: 'No token', status: 401 } }
    }
    return await this.request<{ success: boolean }>(`/auth/posts/like`, {
      method: 'POST',
      body: JSON.stringify({ hash }),
    })
  }

  async unlikePost(hash: string) {
    if (!this.token) {
      return { error: { message: 'No token', status: 401 } }
    }
    return await this.request<{ success: boolean }>(`/auth/posts/unlike`, {
      method: 'POST',
      body: JSON.stringify({ hash }),
    })
  }

  async getNotifications() {
    if (!this.token) {
      return { error: { message: 'No token', status: 401 } }
    }
    return await this.request<{ data: Array<Post> }>(`/auth/notifications`)
  }

  async getNFTCollection(chainId: number, tokenAddress: string) {
    return await this.request<SimplehashNFTCollection>(
      `/nfts/collections/${chainId}/${tokenAddress}`
    )
  }
}

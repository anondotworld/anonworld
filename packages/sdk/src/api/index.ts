import { ProofData } from '@anonworld/zk'
import { ApiResponse, RequestConfig } from './types'

export class Api {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
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
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { headers = {}, isFormData = false, ...options } = config

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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: finalHeaders,
    })

    const result = await this.handleResponse<T>(response)

    return result
  }

  async submitAction({
    proof,
    actionId,
    data,
  }: {
    proof: ProofData
    actionId: string
    data: any
  }) {
    return await this.request<{ success: boolean; hash?: string; tweetId?: string }>(
      '/actions/submit',
      {
        method: 'POST',
        body: JSON.stringify({
          proof: {
            proof: Array.from(proof.proof),
            publicInputs: proof.publicInputs,
          },
          actionId,
          data,
        }),
      }
    )
  }

  async getMerkleTree(id: string) {
    return await this.request<{ _nodes: string[][] }>(`/merkle-tree/${id}`)
  }
}

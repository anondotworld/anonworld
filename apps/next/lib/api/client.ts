import { ApiResponse, RequestConfig } from './types'

export class ApiClient {
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
    const { headers = {}, ...options } = config

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    })

    const result = await this.handleResponse<T>(response)

    return result
  }
}

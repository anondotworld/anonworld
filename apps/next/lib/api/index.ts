import type {
  Cast,
  Channel,
  GetCastsResponse,
  ValidateFrameResponse,
  UploadImageResponse,
} from '../types'
import { TOKEN_ADDRESS } from '../utils'
import { ApiClient } from './client'
import type { Identity } from '@anon/api/src/services/types'

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '')

export const api = {
  getNewPosts: async () => {
    const response = await apiClient.request<GetCastsResponse>(
      `/feed/${TOKEN_ADDRESS}/new`
    )
    return response.data
  },
  getTrendingPosts: async () => {
    const response = await apiClient.request<GetCastsResponse>(
      `/feed/${TOKEN_ADDRESS}/trending`
    )
    return response.data
  },
  getNewLaunches: async () => {
    const response = await apiClient.request<GetCastsResponse>(
      `/feed/${TOKEN_ADDRESS}/launches/new`
    )
    return response.data
  },
  getPromotedLaunches: async () => {
    const response = await apiClient.request<GetCastsResponse>(
      `/feed/${TOKEN_ADDRESS}/launches/promoted`
    )
    return response.data
  },
  getCast: async (identifier: string) => {
    const response = await apiClient.request<Cast>(`/get-cast?identifier=${identifier}`)
    return response.data
  },
  getChannel: async (identifier: string) => {
    const response = await apiClient.request<Channel>(
      `/get-channel?identifier=${identifier}`
    )
    return response.data
  },
  validateFrame: async (data: string) => {
    const response = await apiClient.request<ValidateFrameResponse>(
      `/validate-frame?data=${data}`
    )
    return response.data
  },
  uploadImage: async (image: File) => {
    const formData = new FormData()
    formData.append('image', image)

    const response = await apiClient.request<UploadImageResponse>('/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })

    return response
  },
  revealPost: async (
    castHash: string,
    message: string,
    revealPhrase: string,
    signature: string,
    address: string
  ) => {
    const response = await apiClient.request<{ success: boolean }>(`/posts/reveal`, {
      method: 'POST',
      body: JSON.stringify({
        castHash,
        message,
        revealPhrase,
        signature,
        address,
        tokenAddress: TOKEN_ADDRESS,
      }),
    })
    return response.data
  },
  getPost: async (hash: string) => {
    const response = await apiClient.request<Cast>(`/posts/${hash}`)
    return response.data
  },
  getIdentity: async (address: string) => {
    const response = await apiClient.request<Identity>(`/identity?address=${address}`)
    return response.data
  },
}

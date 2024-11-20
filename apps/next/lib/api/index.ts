import { ProofType, Tree } from '@anon/utils/src/proofs'
import { Cast, GetCastsResponse, PostCastResponse, ValidateFrameResponse } from '../types'
import { ApiClient } from './client'

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '')

export const api = {
  getNewPosts: async (tokenAddress: string) => {
    const response = await apiClient.request<GetCastsResponse>(
      `/feed/${tokenAddress}/new`
    )
    return response.data
  },
  getTrendingPosts: async (tokenAddress: string) => {
    const response = await apiClient.request<GetCastsResponse>(
      `/feed/${tokenAddress}/trending`
    )
    return response.data
  },
  getMerkleTree: async (tokenAddress: string, proofType: ProofType) => {
    const response = await apiClient.request<Tree>(`/merkle-tree`, {
      method: 'POST',
      body: JSON.stringify({ tokenAddress, proofType }),
    })
    return response.data
  },
  submitAction: async (type: ProofType, proof: number[], publicInputs: number[][]) => {
    await apiClient.request(`/posts/submit`, {
      method: 'POST',
      body: JSON.stringify({ type, proof, publicInputs }),
    })
  },
  createPost: async (proof: number[], publicInputs: number[][]) => {
    const response = await apiClient.request<PostCastResponse>(`/posts/create`, {
      method: 'POST',
      body: JSON.stringify({ proof, publicInputs }),
    })
    return response.data
  },
  deletePost: async (proof: number[], publicInputs: number[][]) => {
    const response = await apiClient.request<{ success: boolean }>(`/posts/delete`, {
      method: 'POST',
      body: JSON.stringify({ proof, publicInputs }),
    })
    return response.data
  },
  promotePost: async (proof: number[], publicInputs: number[][]) => {
    const response = await apiClient.request<
      { success: false } | { success: true; tweetId: string }
    >(`/posts/promote`, {
      method: 'POST',
      body: JSON.stringify({ proof, publicInputs }),
    })
    return response.data
  },
  getCast: async (identifier: string) => {
    const response = await apiClient.request<Cast>(`/get-cast?identifier=${identifier}`)
    return response.data
  },
  validateFrame: async (data: string) => {
    const response = await apiClient.request<ValidateFrameResponse>(
      `/validate-frame?data=${data}`
    )
    return response.data
  },
}

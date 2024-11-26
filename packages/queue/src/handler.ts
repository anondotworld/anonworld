import { ProofType } from '@anon/utils/src/proofs/generate'
import { QueueArgs } from './utils'

export async function handler(data: QueueArgs) {
  switch (data.type) {
    case ProofType.CREATE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/create`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to create post')
      }
      return result
    }
    case ProofType.DELETE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/delete`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to delete post')
      }
      return result
    }
    case ProofType.LAUNCH_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/launch`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to launch post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to launch post')
      }
      return result
    }
    case ProofType.PROMOTE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/promote`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to promote post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to promote post')
      }
      return result
    }
  }
}

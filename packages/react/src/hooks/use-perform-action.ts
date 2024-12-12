import { useState } from 'react'
import { useSDK } from '../sdk'
import { useAccount } from 'wagmi'

export type PerformActionStatus =
  | {
      status: 'idle' | 'loading' | 'success'
    }
  | {
      status: 'error'
      error: string
    }

type CreatePostActionData = {
  text?: string
  embeds?: string[]
  quote?: string
  channel?: string
  parent?: string
  revealHash?: string
}

type DeletePostActionData = {
  hash: string
}

type PromotePostActionData = {
  hash: string
  reply?: boolean
}

type PerformActionData =
  | CreatePostActionData
  | DeletePostActionData
  | PromotePostActionData

export const usePerformAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (response: {
    success: boolean
    hash?: string
    tweetId?: string
  }) => void
  onError?: (error: string) => void
} = {}) => {
  const { sdk, credentials } = useSDK()
  const [status, setStatus] = useState<PerformActionStatus>({ status: 'idle' })
  const { address } = useAccount()

  const performAction = async (actionId: string, data: PerformActionData) => {
    try {
      if (!address) {
        throw new Error('Not connected')
      }

      setStatus({ status: 'loading' })

      const credentialId =
        actionId === 'e6138573-7b2f-43ab-b248-252cdf5eaeee'
          ? 'erc20-balance:8453:0x0db510e79909666d6dec7f5e49370838c16d950f:5000000000000000000000'
          : 'erc20-balance:8453:0x0db510e79909666d6dec7f5e49370838c16d950f:2000000000000000000000000'

      let credential = credentials.get(credentialId)
      if (!credential) {
        credential = await credentials.add(credentialId)
      }

      if (!credential) {
        throw new Error('No credential found')
      }

      const response = await sdk.submitAction({
        data,
        actionId,
        credentials: [credential],
      })

      if (!response.data?.results[0].success) {
        throw new Error('Failed to perform action')
      }

      setStatus({ status: 'success' })
      onSuccess?.(response.data.results[0])
    } catch (e) {
      console.error(e)
      setStatus({ status: 'error', error: 'Failed to perform action' })
      onError?.('Failed to perform action')
    }
  }

  return {
    performAction,
    status,
  }
}
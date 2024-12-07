import { useState } from 'react'
import { useAccount } from 'wagmi'
import { sdk } from '@/lib/utils'
import { PerformActionArgs, PerformActionResponse } from '@anonworld/sdk'
import { hashMessage } from 'viem'
import { useAuth } from '../context/auth'

export type PerformActionStatus =
  | {
      status: 'idle' | 'loading' | 'success'
    }
  | {
      status: 'error'
      error: string
    }

export const usePerformAction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (response: PerformActionResponse) => void
  onError?: (error: string) => void
} = {}) => {
  const [status, setStatus] = useState<PerformActionStatus>({ status: 'idle' })
  const { address } = useAccount()
  const { siwe } = useAuth()

  const performAction = async (actionId: string, data: PerformActionArgs['data']) => {
    try {
      if (!address) {
        throw new Error('Not connected')
      }
      if (!siwe) {
        throw new Error('Not signed in')
      }

      setStatus({ status: 'loading' })

      const response = await sdk.performAction({
        address,
        signature: siwe.signature,
        messageHash: hashMessage(siwe.message),
        data,
        actionId,
      })

      if (!response.data?.success) {
        throw new Error('Failed to perform action')
      }

      setStatus({ status: 'success' })
      onSuccess?.(response)
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

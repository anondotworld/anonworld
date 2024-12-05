import { sdk } from '@/lib/utils'
import { useState } from 'react'
import { hashMessage } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

type LaunchState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'done'
    }
  | {
      status: 'error'
      error: string
    }

export const useLaunchPost = () => {
  const [launchState, setLaunchState] = useState<LaunchState>({ status: 'idle' })
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const launchPost = async (hash: string) => {
    if (!address) return

    setLaunchState({ status: 'signature' })
    try {
      const data = {
        hash,
      }
      const message = JSON.stringify(data)
      const signature = await signMessageAsync({
        message,
      })
      if (!signature) {
        setLaunchState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setLaunchState({ status: 'generating' })

      const response = await sdk.performAction({
        address,
        signature,
        messageHash: hashMessage(message),
        data,
        actionId: '083ca1d2-b661-4465-b025-3dd8a18532f6',
      })

      if (!response.data?.success) {
        throw new Error('Failed to launch')
      }

      setLaunchState({ status: 'idle' })
    } catch (e) {
      setLaunchState({ status: 'error', error: 'Failed to launch' })
      console.error(e)
    }
  }

  return {
    launchPost,
    launchState,
  }
}

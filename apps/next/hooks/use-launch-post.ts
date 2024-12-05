import { AnonWorldSDK } from '@anonworld/sdk'
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
  const sdk = new AnonWorldSDK(
    process.env.NEXT_PUBLIC_ANONWORLD_API_URL || 'http://localhost:3001'
  )
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
        actionId: 'ab637e2e-2ab1-4708-90a9-942b2505fe15',
      })

      if (!response.data?.success) {
        throw new Error('Failed to launch')
      }

      setLaunchState({ status: 'idle' })
      return response.data
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

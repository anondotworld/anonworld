import { useState } from 'react'
import { hashMessage } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'
import { useToast } from './use-toast'
import { ToastAction } from '@/components/ui/toast'
import { sdk } from '@/lib/utils'

type PromoteState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'done'
    }
  | {
      status: 'error'
      error: string
    }

export const usePromotePost = () => {
  const { toast } = useToast()
  const [promoteState, setPromoteState] = useState<PromoteState>({ status: 'idle' })
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const promotePost = async (hash: string, reply?: boolean) => {
    if (!address) return

    setPromoteState({ status: 'signature' })
    try {
      const data = {
        hash,
        reply,
      }
      const message = JSON.stringify(data)
      const signature = await signMessageAsync({
        message,
      })
      if (!signature) {
        setPromoteState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setPromoteState({ status: 'generating' })

      const response = await sdk.performAction({
        address,
        signature,
        messageHash: hashMessage(message),
        data,
        actionId: '083ca1d2-b661-4465-b025-3dd8a18532f6',
      })

      if (!response.data?.success) {
        throw new Error('Failed to promote')
      }

      setPromoteState({ status: 'idle' })
      toast({
        title: 'Post promoted',
        action: (
          <ToastAction
            altText="View post"
            onClick={() => {
              window.open(`https://x.com/i/status/${response.data.tweetId}`, '_blank')
            }}
          >
            View on X
          </ToastAction>
        ),
      })
    } catch (e) {
      setPromoteState({ status: 'error', error: 'Failed to promote' })
      console.error(e)
      toast({
        variant: 'destructive',
        title: 'Failed to promote',
        description: 'Please try again.',
      })
    }
  }

  return {
    promotePost,
    promoteState,
    setPromoteState,
  }
}

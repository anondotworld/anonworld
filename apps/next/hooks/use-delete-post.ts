import { useState } from 'react'
import { hashMessage } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'
import { useToast } from './use-toast'
import { sdk } from '@/lib/utils'

type DeleteState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'done'
    }
  | {
      status: 'error'
      error: string
    }

export const useDeletePost = () => {
  const { toast } = useToast()
  const [deleteState, setDeleteState] = useState<DeleteState>({ status: 'idle' })
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const deletePost = async (hash: string) => {
    if (!address) return

    setDeleteState({ status: 'signature' })
    try {
      const data = {
        hash,
      }
      const message = JSON.stringify(data)
      const signature = await signMessageAsync({
        message,
      })
      if (!signature) {
        setDeleteState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setDeleteState({ status: 'generating' })

      const response = await sdk.performAction({
        address,
        signature,
        messageHash: hashMessage(message),
        data,
        actionId: 'd4890070-d70f-4bfe-9c37-863ab9608205',
      })

      if (!response.data?.success) {
        throw new Error('Failed to delete')
      }

      setDeleteState({ status: 'idle' })
      toast({
        title: 'Post deleted',
      })
    } catch (e) {
      setDeleteState({ status: 'error', error: 'Failed to delete' })
      console.error(e)
      toast({
        variant: 'destructive',
        title: 'Failed to delete',
        description: 'Please try again.',
      })
    }
  }

  return {
    deletePost,
    deleteState,
    setDeleteState,
  }
}

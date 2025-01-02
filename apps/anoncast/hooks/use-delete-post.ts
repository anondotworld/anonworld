import { useToast } from '@/lib/hooks/use-toast'
import { useActions, useCredentials, useExecuteActions } from '@anonworld/react'
import { getUsableCredential } from '../../../packages/react/src/utils'
import { useMemo } from 'react'
import { DELETE_FROM_TWITTER_ACTION_ID } from '@/lib/utils'

export function useDeletePost({ tweetId }: { tweetId: string }) {
  const { data: actions } = useActions()
  const { toast } = useToast()
  const { credentials } = useCredentials()

  const credential = useMemo(() => {
    if (!actions || actions.length === 0) return null
    const action = actions.find((a) => a.id === DELETE_FROM_TWITTER_ACTION_ID)
    if (!action) return null
    return getUsableCredential(credentials, action)
  }, [credentials, actions])

  return useExecuteActions({
    credentials: credential ? [credential] : [],
    actions: [
      {
        actionId: DELETE_FROM_TWITTER_ACTION_ID,
        data: {
          tweetId,
        },
      },
    ],
    onSuccess: () => {
      toast({
        title: 'Post deleted',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete',
        description: error.message,
      })
    },
  })
}

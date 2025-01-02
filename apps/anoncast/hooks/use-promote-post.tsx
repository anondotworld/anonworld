import { useToast } from '@/lib/hooks/use-toast'
import { useActions, useCredentials, useExecuteActions } from '@anonworld/react'
import { getUsableCredential } from '../../../packages/react/src/utils'
import { useMemo } from 'react'
import { COPY_TO_TWITTER_ACTION_ID } from '@/lib/utils'
import { ToastAction } from '@radix-ui/react-toast'

export function usePromotePost({ hash, reply }: { hash: string; reply: boolean }) {
  const { data: actions } = useActions()
  const { toast } = useToast()
  const { credentials } = useCredentials()

  const credential = useMemo(() => {
    if (!actions || actions.length === 0) return null
    const action = actions.find((a) => a.id === COPY_TO_TWITTER_ACTION_ID)
    if (!action) return null
    return getUsableCredential(credentials, action)
  }, [credentials, actions])

  return useExecuteActions({
    credentials: credential ? [credential] : [],
    actions: [
      {
        actionId: COPY_TO_TWITTER_ACTION_ID,
        data: {
          hash,
          reply,
        },
      },
    ],
    onSuccess: (response) => {
      toast({
        title: 'Post promoted',
        action: (
          <ToastAction
            altText="View post"
            onClick={() => {
              const tweetId = response.findLast((r) => r.tweetId)?.tweetId
              window.open(`https://x.com/i/status/${tweetId}`, '_blank')
            }}
          >
            View on X
          </ToastAction>
        ),
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to promote',
        description: error.message,
      })
    },
  })
}

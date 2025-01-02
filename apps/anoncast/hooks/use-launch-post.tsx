import { useToast } from '@/lib/hooks/use-toast'
import { useActions, useCredentials, useExecuteActions } from '@anonworld/react'
import { getUsableCredential } from '../../../packages/react/src/utils'
import { useMemo } from 'react'
import { COPY_TO_ANONFUN_ACTION_ID } from '@/lib/utils'
import { ToastAction } from '@radix-ui/react-toast'

export function useLaunchPost({ hash }: { hash: string }) {
  const { data: actions } = useActions()
  const { toast } = useToast()
  const { credentials } = useCredentials()

  const credential = useMemo(() => {
    if (!actions || actions.length === 0) return null
    const action = actions.find((a) => a.id === COPY_TO_ANONFUN_ACTION_ID)
    if (!action) return null
    return getUsableCredential(credentials, action)
  }, [credentials, actions])

  return useExecuteActions({
    credentials: credential ? [credential] : [],
    actions: [
      {
        actionId: COPY_TO_ANONFUN_ACTION_ID,
        data: {
          hash,
        },
      },
    ],
    onSuccess: (response) => {
      toast({
        title: 'Post launched',
        action: (
          <ToastAction
            altText="View post"
            onClick={() => {
              const hash = response.findLast((r) => r.hash)?.hash
              window.open(`https://warpcast.com/~/conversations/${hash}`, '_blank')
            }}
          >
            View on Warpcast
          </ToastAction>
        ),
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to launch',
        description: error.message,
      })
    },
  })
}

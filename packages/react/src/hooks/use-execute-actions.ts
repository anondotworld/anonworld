import { useMutation } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'
import { Credential, ExecuteAction } from '../types'

type ExecuteActionsResponse = {
  success: boolean
  hash?: string
  tweetId?: string
}

export function useExecuteActions({
  credentials,
  actions,
  onSuccess,
  onError,
}: {
  credentials: Credential[]
  actions: Omit<ExecuteAction, 'credentials'>[]
  onSuccess?: (response: ExecuteActionsResponse[]) => void
  onError?: (error: Error) => void
}) {
  const { sdk } = useSDK()

  const formatActions = async (): Promise<ExecuteAction[]> => {
    if (credentials.length === 0) return []
    const formattedActions = await Promise.all(
      actions.map(async ({ actionId, data }) => {
        const action = await sdk.getAction(actionId)
        if (!action.data) {
          return null
        }

        const credentialId = action.data.credential_id
        if (!credentialId) {
          return {
            actionId,
            data,
            credentials: credentials.map((c) => c.id),
          }
        }

        const credential = credentials.find((c) => c.credential_id === credentialId)
        if (!credential) {
          return null
        }

        const requirement = action.data.credential_requirement
        if (!requirement) {
          return {
            actionId,
            data,
            credentials: [credential.id],
          }
        }

        const credentialBalance = credential.metadata?.balance
        if (!credentialBalance) {
          return null
        }

        if (BigInt(credentialBalance) < BigInt(requirement.minimumBalance)) {
          return null
        }

        return {
          actionId,
          data,
          credentials: [credential.id],
        }
      })
    )

    return formattedActions.filter((a) => a !== null)
  }

  return useMutation({
    mutationFn: async () => {
      const formattedActions = await formatActions()
      if (formattedActions.length === 0) {
        throw new Error('Missing required credential')
      }
      const response = await sdk.executeActions(formattedActions)
      if (!response.data?.results?.[0]?.success) {
        throw new Error('Failed to perform actions')
      }
      return response.data?.results
    },
    onSuccess(data, variables, context) {
      if (!data) return
      onSuccess?.(data)
    },
    onError(error, variables, context) {
      onError?.(error)
    },
  })
}

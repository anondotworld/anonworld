import { useSDK } from '../providers/sdk'
import { useMutation } from '@tanstack/react-query'
import { RevealPostArgs } from '@anonworld/common'

export function usePostReveal() {
  const { sdk } = useSDK()
  return useMutation({
    mutationFn: async (args: RevealPostArgs) => {
      const response = await sdk.revealPost(args)
      return response?.data ?? null
    },
  })
}

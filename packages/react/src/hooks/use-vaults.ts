import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useVaults(passkeyId: string | null) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['vaults', passkeyId],
    queryFn: async () => {
      if (!passkeyId) return []
      const data = await sdk.getVaults(passkeyId)
      return data.data?.data ?? []
    },
    enabled: !!passkeyId,
  })
}

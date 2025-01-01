import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'
import { useAuth } from '../providers'

export function useVaults() {
  const { sdk } = useSDK()
  const { passkeyId } = useAuth()
  return useQuery({
    queryKey: ['vaults'],
    queryFn: async () => {
      const data = await sdk.getVaults()
      if (data.error) {
        return []
      }
      return data.data?.data ?? []
    },
    enabled: !!passkeyId,
  })
}

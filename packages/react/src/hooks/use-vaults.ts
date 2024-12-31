import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useVaults() {
  const { sdk, auth } = useSDK()
  return useQuery({
    queryKey: ['vaults', auth?.passkeyId],
    queryFn: async () => {
      if (!auth?.token) return []
      const data = await sdk.getVaults(auth.token)
      return data.data?.data ?? []
    },
    enabled: !!auth?.token,
  })
}

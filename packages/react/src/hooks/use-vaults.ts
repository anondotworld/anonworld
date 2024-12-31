import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useVaults() {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['vaults'],
    queryFn: async () => {
      const data = await sdk.getVaults()
      if (data.error) {
        return []
      }
      return data.data?.data ?? []
    },
  })
}

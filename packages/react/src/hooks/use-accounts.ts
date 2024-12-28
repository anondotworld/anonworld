import { useSDK } from '../providers/sdk'
import { useQuery } from '@tanstack/react-query'

export function useAccounts() {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const data = await sdk.getAccounts()
      return data?.data?.data ?? []
    },
  })
}

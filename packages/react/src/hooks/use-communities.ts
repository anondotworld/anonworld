import { useSDK } from '../providers/sdk'
import { useQuery } from '@tanstack/react-query'

export function useCommunities() {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const data = await sdk.getCommunities()
      return data?.data?.data ?? []
    },
  })
}

import { useSDK } from '../providers/sdk'
import { useQuery } from '@tanstack/react-query'

export function useCommunity({ id }: { id: string }) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      const data = await sdk.getCommunity(id)
      return data?.data ?? null
    },
  })
}

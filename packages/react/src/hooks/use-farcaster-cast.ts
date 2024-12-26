import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useFarcasterCast(identifier: string) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['farcaster-cast', identifier],
    queryFn: async () => {
      const cast = await sdk.getFarcasterCast(identifier)
      return cast?.data ?? null
    },
  })
}

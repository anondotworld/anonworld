import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useFarcasterIdentity(identifier: string) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['farcaster-identity', identifier],
    queryFn: async () => {
      const user = await sdk.getFarcasterIdentity(identifier)
      return user?.data ?? null
    },
  })
}

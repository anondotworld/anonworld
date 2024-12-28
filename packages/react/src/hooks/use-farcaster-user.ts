import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useFarcasterUser(fid: number) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['farcaster-user', fid],
    queryFn: async () => {
      const user = await sdk.getFarcasterUser(fid)
      return user?.data ?? null
    },
  })
}

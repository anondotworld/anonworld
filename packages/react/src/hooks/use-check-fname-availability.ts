import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function useCheckFnameAvailability(username: string) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['fname', username],
    queryFn: async () => {
      const user = await sdk.checkFnameAvailability(username)
      return user?.data?.available ?? false
    },
    enabled: !!username,
  })
}

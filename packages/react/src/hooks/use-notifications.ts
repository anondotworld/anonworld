import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'

export function useNotifications() {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await sdk.getNotifications()
      if (data.error) {
        return []
      }
      return data.data.data ?? []
    },
  })
}

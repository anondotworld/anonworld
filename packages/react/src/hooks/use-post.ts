import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'

export function usePost({ hash }: { hash: string }) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['post', hash],
    queryFn: async () => {
      const response = await sdk.getPost(hash)
      return response.data ?? null
    },
  })
}

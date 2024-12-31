import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'

export const useVaultPosts = (vaultId: string) => {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['vault-posts', vaultId],
    queryFn: async () => {
      const data = await sdk.getVaultPosts(vaultId)
      return data.data?.data ?? []
    },
  })
}

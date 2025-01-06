import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'

export const useVault = (vaultId: string) => {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['vault', vaultId],
    queryFn: async () => {
      const data = await sdk.getVault(vaultId)
      return data.data ?? null
    },
    enabled: !!vaultId,
  })
}

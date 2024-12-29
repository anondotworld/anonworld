import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'
import { useAccount } from 'wagmi'

export function useWalletFungibles() {
  const { sdk } = useSDK()
  const { address } = useAccount()
  return useQuery({
    queryKey: ['wallet-fungibles', address],
    queryFn: async () => {
      if (!address) return []
      const data = await sdk.getWalletFungibles(address)
      return data.data?.data ?? []
    },
    enabled: !!address,
  })
}

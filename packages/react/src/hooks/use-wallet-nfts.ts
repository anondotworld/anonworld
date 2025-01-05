import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'
import { useAccount } from 'wagmi'

export function useWalletNFTs() {
  const { sdk } = useSDK()
  const { address } = useAccount()
  return useQuery({
    queryKey: ['wallet-nfts', address],
    queryFn: async () => {
      if (!address) return []
      const data = await sdk.getWalletNFTs(address)
      return data.data?.data ?? []
    },
    enabled: !!address,
  })
}

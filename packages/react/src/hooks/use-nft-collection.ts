import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'

export function useNFTCollection({
  chainId,
  address,
}: {
  chainId: number
  address: string
}) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['nft-collection', chainId, address],
    queryFn: async () => {
      const response = await sdk.getNFTCollection(chainId, address)
      return response.data ?? null
    },
  })
}

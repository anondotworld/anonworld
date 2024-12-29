import { useSDK } from '../providers/sdk'
import { useQuery } from '@tanstack/react-query'

export function useSwapQuote(args: {
  chainId: number
  taker: string
  buyToken: string
  sellToken: string
  sellAmount: string
}) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['swap-quote', args],
    queryFn: async () => {
      const data = await sdk.getSwapQuote(args)
      return data?.data?.data ?? null
    },
  })
}

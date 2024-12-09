import { TOKEN_ADDRESS } from '@/lib/utils'
import { erc20Abi } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

export function useBalance() {
  const { address } = useAccount()
  return useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
  })
}

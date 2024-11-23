import { erc20Abi } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

export function useBalance(tokenAddress: string) {
  const { address } = useAccount()
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
  })
}

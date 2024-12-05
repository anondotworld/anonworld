'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { TOKEN_ADDRESS } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { CircleHelp, ExternalLink, Loader2 } from 'lucide-react'
import React from 'react'
import { createPublicClient, erc20Abi, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http(),
})

async function getConnectedAddress(data: string) {
  const frameData = await api.validateFrame(data)
  if (!frameData) return null

  const balances = await Promise.all(
    frameData.action.interactor.verified_addresses.eth_addresses.map(async (address) => {
      const balance = await client.readContract({
        address: TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })

      return {
        address,
        balance: balance.toString(),
      }
    })
  )

  if (balances.length === 0) return null

  const validBalance = balances.find((b) => BigInt(b.balance) >= BigInt(20000))

  return validBalance?.address || balances[0].address
}

export default function CreatePostPage({
  searchParams,
}: {
  searchParams: { data: string }
}) {
  const { isLoading } = useQuery({
    queryKey: ['validate-frame', searchParams.data],
    queryFn: () => getConnectedAddress(searchParams.data),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col p-4 max-w-screen-sm mx-auto gap-8">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold">anoncast</div>
      </div>
      <Alert>
        <CircleHelp className="h-4 w-4" />
        <AlertTitle className="font-bold">Post anonymously to Farcaster</AlertTitle>
        <AlertDescription>
          Must have <b>20,000 $ANON</b> in your wallet to post. Posts are made anonymous
          using zk proofs. Due to the complex calculations required, it could take up to a
          few minutes to post. We&apos;ll work on speeding this up in the future.
        </AlertDescription>
      </Alert>
      <a href="https://anoncast.org" target="_blank" rel="noreferrer">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <p>Mini-app is currently disabled. Go to anoncast.org to post.</p>
            <ExternalLink size={16} />
          </div>
        </div>
      </a>
    </div>
  )
}

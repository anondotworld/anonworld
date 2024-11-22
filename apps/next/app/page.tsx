'use client'

import ActionComponent from '@/components/action'
import PostFeed from '@/components/post-feed'
import { ANON_ADDRESS } from '@anon/utils/src/config'
import { useAccount } from 'wagmi'

export default function Home() {
  const { address } = useAccount()

  return (
    <div className="flex flex-col gap-8">
      <ActionComponent tokenAddress={ANON_ADDRESS} userAddress={address} />
      <PostFeed tokenAddress={ANON_ADDRESS} userAddress={address} />
    </div>
  )
}

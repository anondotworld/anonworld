'use client'

import { ConnectButton } from '@/components/connect-button'
import { CreatePost } from '@/components/create-post'
import PostFeed from '@/components/post-feed'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ANON_ADDRESS } from '@anon/api/lib/config'
import { CircleHelp } from 'lucide-react'
import { useAccount, useSignMessage } from 'wagmi'

export default function Home() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const getSignature = async ({
    address,
    timestamp,
  }: { address: string; timestamp: number }) => {
    try {
      const message = `${address}:${timestamp}`
      const signature = await signMessageAsync({
        message,
      })
      return { signature, message }
    } catch {
      return
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col p-4 max-w-screen-sm mx-auto gap-8">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold">$ANON</div>
        <ConnectButton />
      </div>
      <Alert>
        <CircleHelp className="h-4 w-4" />
        <AlertTitle className="font-bold">
          Post anonymously to Farcaster and X/Twitter
        </AlertTitle>
        <AlertDescription>
          Posts are made anonymous using zk proofs. Due to the complex calculations
          required, it could take up to a few minutes to post and take other actions.
          We&apos;ll work on speeding this up in the future.
          <br />
          <br />
          <b>Requirements:</b>
          <ul>
            <li>
              - <b>30,000 ANON</b>: Post on Farcaster
            </li>
            <li>
              - <b>1,000,000 ANON</b>: Promote posts to X/Twitter
            </li>
            <li>
              - <b>3,000,000 ANON</b>: Delete posts
            </li>
          </ul>
        </AlertDescription>
      </Alert>
      {address && (
        <CreatePost
          tokenAddress={ANON_ADDRESS}
          userAddress={address}
          getSignature={getSignature}
        />
      )}
      <PostFeed tokenAddress={ANON_ADDRESS} userAddress={address} />
    </div>
  )
}

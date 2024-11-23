'use client'

import ActionComponent from '@/components/action'
import { ConnectButton } from '@/components/connect-button'
import { CreatePostProvider } from '@/components/create-post/context'
import PostFeed from '@/components/post-feed'
import { ANON_ADDRESS } from '@anon/utils/src/config'

export default function Home() {
  return (
    <CreatePostProvider tokenAddress={ANON_ADDRESS}>
      <div className="flex h-screen flex-col p-4 xl:p-8 max-w-screen-sm mx-auto gap-8">
        {/* Header */}
        <div className="flex items-center justify-between xl:absolute xl:top-0 xl:left-0 xl:right-0 xl:p-8 xl:max-w-screen-xl xl:mx-auto">
          <div className="text-lg font-bold flex flex-row items-center font-geist xl:w-64 xl:justify-end">
            <img src="/anon.webp" alt="ANON" className="w-8 h-8 mr-3 rounded-full" />
            <span className="hidden sm:block">anoncast</span>
          </div>
          <ConnectButton />
        </div>

        {/* Info */}
        <ActionComponent tokenAddress={ANON_ADDRESS} />
        <PostFeed tokenAddress={ANON_ADDRESS} />
      </div>
    </CreatePostProvider>
  )
}

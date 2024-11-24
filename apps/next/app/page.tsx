'use client'

import ActionComponent from '@/components/action'
import { CreatePostProvider } from '@/components/create-post/context'
import PostFeed from '@/components/post-feed'
import { ANON_ADDRESS } from '@anon/utils/src/config'

export default function Home() {
  return (
    <CreatePostProvider tokenAddress={ANON_ADDRESS}>
      <div className="flex flex-col gap-8">
        <ActionComponent tokenAddress={ANON_ADDRESS} />
        <PostFeed tokenAddress={ANON_ADDRESS} />
      </div>
    </CreatePostProvider>
  )
}

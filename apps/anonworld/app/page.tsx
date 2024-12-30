'use client'

import { useRouter } from 'next/navigation'
import { NewPost, PostFeed, PostFeedSelector } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'

export default function Home() {
  const router = useRouter()

  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between">
        <PostFeedSelector
          selected="trending"
          onSelect={(sort: string) => {
            if (sort === 'new') {
              router.push('/new')
            } else {
              router.push('/')
            }
          }}
        />
        <NewPost onSuccess={(hash) => router.push(`/posts/${hash}`)} />
      </XStack>
      <PostFeed
        fid={899289}
        type="trending"
        onPress={(hash) => router.push(`/posts/${hash}`)}
      />
    </View>
  )
}

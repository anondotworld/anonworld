'use client'

import { useRouter } from 'next/navigation'
import { NewPost, PostFeed, PostFeedSelector } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'

export default function Home() {
  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between">
        <PostFeedSelector selected="trending" />
        <NewPost />
      </XStack>
      <PostFeed fid={899289} type="trending" />
    </View>
  )
}

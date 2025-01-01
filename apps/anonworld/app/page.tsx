'use client'

import { NewPost, PostFeedSelector, TrendingFeed } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'

export default function Home() {
  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <PostFeedSelector selected="trending" />
        <NewPost />
      </XStack>
      <TrendingFeed fid={899289} />
    </View>
  )
}

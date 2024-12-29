'use client'

import {
  CommunityDisplay,
  NewCommunityPost,
  PostFeed,
  PostFeedSelector,
  useCommunity,
} from '@anonworld/react'
import { Spinner, View, XStack, YStack } from '@anonworld/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CommunityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: community } = useCommunity({ id: params.id })
  const [feedType, setFeedType] = useState('new')

  if (!community) {
    return null
  }

  return (
    <View maxWidth={700} mx="auto" my="$4" gap="$4">
      <YStack gap="$3">
        <CommunityDisplay community={community} />
      </YStack>
      <XStack ai="center" jc="space-between">
        <PostFeedSelector selected={feedType} onSelect={setFeedType} />
        <NewCommunityPost
          onSuccess={(hash) => router.push(`/posts/${hash}`)}
          community={community}
        />
      </XStack>
      <PostFeed
        fid={community.fid}
        type={feedType as 'new' | 'trending'}
        onPress={(hash) => router.push(`/posts/${hash}`)}
      />
    </View>
  )
}

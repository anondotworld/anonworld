'use client'

import {
  CommunityDisplay,
  NewCommunityPost,
  NewFeed,
  useCommunity,
} from '@anonworld/react'
import { View, XStack, YStack } from '@anonworld/ui'

export default function CommunityPage({ params }: { params: { id: string } }) {
  const { data: community } = useCommunity({ id: params.id })

  if (!community) {
    return null
  }

  return (
    <View maxWidth={700} mx="auto" my="$4" gap="$4">
      <YStack gap="$3">
        <CommunityDisplay community={community} />
      </YStack>
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <View />
        <NewCommunityPost community={community} />
      </XStack>
      <NewFeed fid={community.fid} />
    </View>
  )
}

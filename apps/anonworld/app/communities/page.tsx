'use client'

import { CommunityFeed } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'
import { NewCommunity } from '@anonworld/react'

export default function CommunitiesPage() {
  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <View />
        <NewCommunity />
      </XStack>
      <CommunityFeed sort="popular" />
    </View>
  )
}

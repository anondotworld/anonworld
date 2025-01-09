'use client'

import { CommunityFeed } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'
import { NewCommunity } from '@anonworld/react'
import { Content } from '@/components/content'

export default function CommunitiesPage() {
  return (
    <Content>
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <View />
        <NewCommunity />
      </XStack>
      <CommunityFeed sort="popular" />
    </Content>
  )
}

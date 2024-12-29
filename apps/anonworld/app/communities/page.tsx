'use client'

import { CommunityFeed, CommunityFeedSelector } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'
import { NewCommunity } from '@anonworld/react'
import { useRouter } from 'next/navigation'

export default function CommunitiesPage() {
  const router = useRouter()

  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between">
        <CommunityFeedSelector selected="Market Cap" onSelect={() => {}} />
        <NewCommunity />
      </XStack>
      <CommunityFeed onPress={(id) => router.push(`/communities/${id}`)} />
    </View>
  )
}

'use client'

import { CommunityFeed, CommunityFeedSelector } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'
import { NewCommunity } from '@anonworld/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CommunitiesPage() {
  const router = useRouter()
  const [sort, setSort] = useState('popular')

  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between">
        <CommunityFeedSelector selected={sort} onSelect={setSort} />
        <NewCommunity />
      </XStack>
      <CommunityFeed onPress={(id) => router.push(`/communities/${id}`)} sort={sort} />
    </View>
  )
}

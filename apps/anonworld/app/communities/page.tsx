'use client'

import { CommunityFeed } from '@anonworld/react'
import { Separator, Text, View, XStack, YStack } from '@anonworld/ui'
import { NewCommunity } from '@anonworld/react'
import { UsersRound } from '@tamagui/lucide-icons'
import { TextLink } from 'solito/link'

export default function CommunitiesPage() {
  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <YStack bg="$green1" px="$4" py="$3" br="$4" bc="$green8" bw="$0.5" gap="$2">
        <XStack ai="center" gap="$2">
          <UsersRound size={16} color="$green12" strokeWidth={2.5} />
          <Text fos="$2" fow="600" color="$green12">
            Communities
          </Text>
        </XStack>
        <Text fos="$2" fow="400" color="$green12" lineHeight={20}>
          Communities are groups of users with shared credentials. Every community is
          backed by a token, a shared Farcaster account, and a shared wallet. Members of a
          community can take anonymous actions on behalf of the community, such as posting
          to Farcaster and X/Twitter.
        </Text>
        <Separator my="$1.5" bc="$green4" bg="$green4" />
        <Text fos="$2" fow="400" color="$green12" lineHeight={20}>
          Creating new communities will be enabled soon. If you want to create a community
          for your existing token, DM @slokh on{' '}
          <TextLink href="https://warpcast.com/slokh" target="_blank" rel="noreferrer">
            <Text fos="$2" textDecorationLine="underline" col="$green12">
              Farcaster
            </Text>
          </TextLink>{' '}
          or{' '}
          <TextLink href="https://twitter.com/slokh" target="_blank" rel="noreferrer">
            <Text fos="$2" textDecorationLine="underline" col="$green12">
              Twitter
            </Text>
          </TextLink>
          .
        </Text>
      </YStack>
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <View />
        <NewCommunity />
      </XStack>
      <CommunityFeed sort="popular" />
    </View>
  )
}

import { Image, Text, View, XStack, YStack } from '@anonworld/ui'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Community, FarcasterAccount, TwitterAccount } from '../../../types'
import { MessageSquare } from '@tamagui/lucide-icons'
import { CommunityToken } from './token'
import { formatAmount } from '../../../utils'
import { timeAgo } from '../../../utils'
import { CommunityActions } from './actions'

export function CommunityDisplay({
  community,
  onPress,
}: { community: Community; onPress?: () => void }) {
  return (
    <YStack
      key={community.id}
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bbw="$0.5"
      p="$4"
      gap="$4"
      $gtXs={{
        br: '$4',
        bw: '$0.5',
      }}
      onPress={onPress}
      hoverStyle={onPress ? { bg: '$color3' } : {}}
      cursor={onPress ? 'pointer' : undefined}
      f={1}
    >
      <XStack ai="center" gap="$4">
        <Image
          src={community.image_url}
          w="$8"
          h="$8"
          br="$12"
          bc="$borderColor"
          bw="$0.5"
        />
        <YStack gap="$2" f={1}>
          <Text fos="$4" fow="600">
            {community.name}
          </Text>
          <XStack gap="$2">
            <Badge>{timeAgo(community.created_at)}</Badge>
            <Badge icon={<MessageSquare size={12} />}>
              {formatAmount(community.posts)}
            </Badge>
            {community.farcaster && <FarcasterBadge farcaster={community.farcaster} />}
            {community.twitter && <TwitterBadge twitter={community.twitter} />}
          </XStack>
          <Text fos="$2" fow="400" color="$color11">
            {community.description}
          </Text>
        </YStack>
      </XStack>
      <CommunityToken community={community} />
      <View position="absolute" top="$2" right="$3">
        <CommunityActions community={community} />
      </View>
    </YStack>
  )
}

function FarcasterBadge({ farcaster }: { farcaster: FarcasterAccount }) {
  return (
    <Badge
      onPress={() => {
        window.open(`https://warpcast.com/~/${farcaster.username}`, '_blank')
      }}
      icon={<Farcaster size={12} />}
    >
      {`${farcaster.username} `}
      <Text col="$color11">{formatAmount(farcaster.follower_count)}</Text>
    </Badge>
  )
}

function TwitterBadge({ twitter }: { twitter: TwitterAccount }) {
  return (
    <Badge
      onPress={() => {
        window.open(`https://x.com/${twitter.screen_name}`, '_blank')
      }}
      icon={<X size={10} />}
    >
      {`${twitter.screen_name} `}
      <Text col="$color11">{formatAmount(twitter.followers)}</Text>
    </Badge>
  )
}

import { Image, ScrollView, Text, View, XStack, YStack } from '@anonworld/ui'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Community, FarcasterAccount, TwitterAccount } from '../../../types'
import { MessageCircle } from '@tamagui/lucide-icons'
import { CommunityToken } from './token'
import { formatAmount } from '../../../utils'
import { timeAgo } from '../../../utils'
import { CommunityActions } from './actions'
import { Link } from 'solito/link'

export function CommunityDisplay({ community }: { community: Community }) {
  return (
    <YStack
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bw="$0.5"
      p="$3"
      gap="$4"
      br="$4"
      $xs={{
        br: '$0',
        bw: '$0',
        btw: '$0.5',
        bbw: '$0.5',
        px: '$2',
        py: '$3',
      }}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              <Badge>{timeAgo(community.created_at)}</Badge>
              <Badge icon={<MessageCircle size={12} />}>
                {formatAmount(community.posts)}
              </Badge>
              {community.farcaster && <FarcasterBadge farcaster={community.farcaster} />}
              {community.twitter && <TwitterBadge twitter={community.twitter} />}
            </XStack>
          </ScrollView>
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
    <Link href={`https://warpcast.com/~/${farcaster.username}`} target="_blank">
      <Badge icon={<Farcaster size={12} />}>
        {`${farcaster.username} `}
        <Text col="$color11">{formatAmount(farcaster.follower_count)}</Text>
      </Badge>
    </Link>
  )
}

function TwitterBadge({ twitter }: { twitter: TwitterAccount }) {
  return (
    <Link href={`https://x.com/${twitter.screen_name}`} target="_blank">
      <Badge icon={<X size={10} />}>
        {`${twitter.screen_name} `}
        <Text col="$color11">{formatAmount(twitter.followers)}</Text>
      </Badge>
    </Link>
  )
}

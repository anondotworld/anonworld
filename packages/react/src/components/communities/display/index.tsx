import { Button, Image, Separator, Text, View, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import { chains, formatAddress, formatAmount, timeAgo } from '../../../utils'
import { useFarcasterUser } from '../../../hooks/use-farcaster-user'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Community } from '../../../types'
import {
  ArrowLeftRight,
  ArrowUpRight,
  Coins,
  MessageSquare,
  MoreHorizontal,
} from '@tamagui/lucide-icons'
import { useToken } from '../../../hooks'
import { extractChain } from 'viem'
import { CommunityToken } from './token'

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
            {community.fid && <FarcasterBadge fid={community.fid} />}
            {community.twitter_username && (
              <TwitterBadge username={community.twitter_username} />
            )}
          </XStack>
          <Text fos="$2" fow="400" color="$color11">
            {community.description}
          </Text>
        </YStack>
      </XStack>
      <CommunityToken community={community} />
      <View position="absolute" top="$2" right="$3">
        <View p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
          <MoreHorizontal size={20} />
        </View>
      </View>
    </YStack>
  )
}

function FarcasterBadge({ fid }: { fid: number }) {
  const { data } = useFarcasterUser(fid)

  return (
    <Badge
      onPress={() => {
        window.open(`https://warpcast.com/${data?.username}`, '_blank')
      }}
      icon={<Farcaster size={12} />}
    >
      {data?.username}
    </Badge>
  )
}

function TwitterBadge({ username }: { username: string }) {
  return (
    <Badge
      onPress={() => {
        window.open(`https://x.com/${username}`, '_blank')
      }}
      icon={<X size={10} />}
    >
      {username}
    </Badge>
  )
}

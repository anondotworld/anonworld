import { Image, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import { formatAmount, timeAgo } from '../../../utils'
import { useFarcasterUser } from '../../../hooks/use-farcaster-user'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Community } from '../../../types'

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
      p="$3"
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
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$2">
          <Image src={community.image_url} w="$4" h="$4" br="$12" />
          <Field label={community.token.symbol} value={community.name} minWidth="$10" />
        </XStack>
        <XStack gap="$4" ai="center" px="$4">
          <Field
            label="Posts"
            value={community.posts.toLocaleString()}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Mkt Cap"
            value={`$${formatAmount(community.token.market_cap)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Price"
            value={`$${Number(community.token.price_usd).toFixed(4)}`}
            minWidth="$10"
            ai="flex-end"
          />
        </XStack>
      </XStack>
      <XStack gap="$2" ai="center" jc="space-between">
        <XStack gap="$2">
          <Badge>{timeAgo(community.created_at)}</Badge>
        </XStack>
        <XStack gap="$2">
          {community.fid && <FarcasterBadge fid={community.fid} />}
          {community.twitter_username && (
            <TwitterBadge username={community.twitter_username} />
          )}
        </XStack>
      </XStack>
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

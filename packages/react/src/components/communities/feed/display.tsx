import { Image, Text, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import { formatAmount, timeAgo } from '../../../utils'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Community, FarcasterAccount, TwitterAccount } from '../../../types'
import { Link } from 'solito/link'

export function CommunityDisplay({
  community,
  hoverable,
}: { community: Community; hoverable?: boolean }) {
  return (
    <YStack
      key={community.id}
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bbw="$0.5"
      p="$3"
      gap="$3"
      $gtXs={{
        br: '$4',
        bw: '$0.5',
      }}
      hoverStyle={hoverable ? { bg: '$color3' } : {}}
      cursor={hoverable ? 'pointer' : undefined}
      f={1}
    >
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$3">
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
            label="Followers"
            value={community.followers.toLocaleString()}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Mkt Cap"
            value={`$${formatAmount(community.token.market_cap)}`}
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
          {community.farcaster && <FarcasterBadge farcaster={community.farcaster} />}
          {community.twitter && <TwitterBadge twitter={community.twitter} />}
        </XStack>
      </XStack>
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

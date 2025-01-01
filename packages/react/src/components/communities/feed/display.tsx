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
      bw="$0.5"
      p="$3"
      gap="$4"
      br="$4"
      $xs={{
        br: '$0',
        bw: '$0',
        btw: '$0.5',
        px: '$2',
        py: '$3',
      }}
      hoverStyle={hoverable ? { bg: '$color3' } : {}}
      cursor={hoverable ? 'pointer' : undefined}
      f={1}
    >
      <XStack ai="center" jc="space-between" $xs={{ ai: 'flex-start' }}>
        <XStack ai="center" gap="$3">
          <Image src={community.image_url} w="$4" h="$4" br="$12" />
          <YStack gap="$1" minWidth="$10">
            <Text fow="600">{community.name}</Text>
            <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
              {community.token.symbol}
            </Text>
          </YStack>
        </XStack>
        <XStack
          gap="$4"
          ai="center"
          px="$4"
          $xs={{ flexDirection: 'column', gap: '$2', ai: 'flex-start' }}
        >
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
    <Link href={`https://warpcast.com/${farcaster.username}`} target="_blank">
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

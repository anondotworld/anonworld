import { Image, Text, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import { formatAmount, timeAgo } from '../../../utils'
import { useFarcasterUser } from '../../../hooks/use-farcaster-user'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Community, CredentialRequirement } from '../../../types'
import { useActions } from '../../../hooks/use-actions'
import { Action, ActionType } from '../../../types'
import { formatUnits } from 'viem'
import { useToken } from '../../../hooks/use-token'
import { MessageSquare } from '@tamagui/lucide-icons'

export function CommunityDisplay({ community }: { community: Community }) {
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
      f={1}
    >
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$2">
          <Image src={community.image_url} w="$4" h="$4" br="$12" />
          <Field label={community.symbol} value={community.name} minWidth="$10" />
        </XStack>
        <XStack gap="$4" ai="center" px="$4">
          <Field
            label="Mkt Cap"
            value={`$${formatAmount(community.market_cap)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Price"
            value={`$${Number(community.price_usd).toFixed(2)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Holders"
            value={formatAmount(community.holders)}
            minWidth="$10"
            ai="flex-end"
          />
        </XStack>
      </XStack>
      <Actions community={community} />
    </YStack>
  )
}

function Actions({ community }: { community: Community }) {
  const { data } = useActions()

  return (
    <XStack gap="$2" ai="center" jc="space-between">
      <XStack gap="$2">
        <Badge>{timeAgo(community.created_at)}</Badge>
        <Badge icon={<MessageSquare size={12} />}>{formatAmount(community.posts)}</Badge>
      </XStack>
      <XStack gap="$2">
        {data?.map((action) => {
          switch (action.type) {
            case ActionType.COPY_POST_FARCASTER:
              if (action.metadata.fid === community.fid) {
                return <CopyPostFarcaster fid={action.metadata.fid} action={action} />
              }
              break
            case ActionType.COPY_POST_TWITTER:
              if (action.metadata.twitter === community.twitter_username) {
                return <TwitterBadge action={action} />
              }
              break
          }

          return null
        })}
      </XStack>
    </XStack>
  )
}

function CopyPostFarcaster({ fid, action }: { fid: number; action: Action }) {
  const { data } = useFarcasterUser(fid)

  if (action.type !== ActionType.COPY_POST_FARCASTER) {
    return null
  }

  return (
    <Badge
      onPress={() => {
        window.open(`https://warpcast.com/${data?.username}`, '_blank')
      }}
      icon={<Farcaster size={12} />}
    >
      {data?.username}
      {action.credential_requirement && (
        <ERC20Requirement req={action.credential_requirement} />
      )}
    </Badge>
  )
}

function TwitterBadge({ action }: { action: Action }) {
  if (action.type !== ActionType.COPY_POST_TWITTER) {
    return null
  }

  return (
    <Badge
      onPress={() => {
        window.open(`https://x.com/${action.metadata.twitter}`, '_blank')
      }}
      icon={<X size={10} />}
    >
      {action.metadata.twitter}
      {action.credential_requirement && (
        <ERC20Requirement req={action.credential_requirement} />
      )}
    </Badge>
  )
}

function ERC20Requirement({
  req,
}: {
  req: CredentialRequirement
}) {
  const { data } = useToken({
    chainId: Number(req.chainId),
    address: req.tokenAddress,
  })

  const symbol = data?.attributes.symbol
  const implementation = data?.attributes.implementations[0]
  const amount = Number.parseFloat(
    formatUnits(BigInt(req.minimumBalance), implementation?.decimals ?? 18)
  )

  return (
    <Text fos="$1" fow="400" color="$color11">
      {` • ${formatAmount(amount)} ${symbol}`}
    </Text>
  )
}

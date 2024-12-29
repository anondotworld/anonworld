import { Image, Separator, Text, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import { chains, formatAddress, formatAmount } from '../../../utils'
import { extractChain } from 'viem'
import { formatEther, formatUnits } from 'viem'
import { useToken } from '../../../hooks'
import { useActions } from '../../../hooks/use-actions'
import { Action, ActionType, Community } from '../../../types'
import { useSDK } from '../../../providers'
import { getUsableCredential } from '../../../utils'
import { CircleCheck, CircleX } from '@tamagui/lucide-icons'

export function CommunityToken({ community }: { community: Community }) {
  const { data } = useToken({
    chainId: community.chain_id,
    address: community.token_address,
  })

  const chain = extractChain({ chains, id: Number(community.chain_id) as any })
  return (
    <YStack gap="$4" mt="$2">
      <XStack gap="$4" ai="center">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Token
        </Text>
        <Separator />
      </XStack>
      <XStack ai="center" jc="space-between">
        <YStack gap="$1" minWidth="$10">
          <XStack ai="center" gap="$2">
            {data?.attributes.icon.url && (
              <Image src={data?.attributes.icon.url} w={16} h={16} />
            )}
            <Text fow="600">{data?.attributes.symbol}</Text>
          </XStack>
          <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
            {`${chain.name} | ${formatAddress(community.token_address)}`}
          </Text>
        </YStack>
        <XStack gap="$4" ai="center" jc="flex-end" px="$4" fg={1}>
          <Field
            label="Mkt Cap"
            value={`$${formatAmount(community.market_cap)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Price"
            value={`$${Number(community.price_usd).toFixed(4)}`}
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
      <XStack gap="$4" ai="flex-end" jc="space-between" mt="$2">
        <CommunityActions community={community} />
      </XStack>
    </YStack>
  )
}

type CommunityAction = {
  value: string
  action: Action
  twitter: string[]
  farcaster: string[]
}

export function CommunityActions({ community }: { community: Community }) {
  const { data: actions } = useActions()

  const communityActions: Record<number, CommunityAction> = {}

  for (const action of actions ?? []) {
    if (
      !action.credential_requirement ||
      action.credential_requirement.tokenAddress !== community.token_address ||
      ('fid' in action.metadata && action.metadata.fid !== community.fid)
    ) {
      continue
    }

    const value = Number.parseFloat(
      formatEther(BigInt(action.credential_requirement.minimumBalance))
    )
    if (!communityActions[value]) {
      communityActions[value] = {
        value: action.credential_requirement.minimumBalance,
        action,
        twitter: [],
        farcaster: [],
      }
    }

    switch (action.type) {
      case ActionType.COPY_POST_TWITTER:
        communityActions[value].twitter.unshift('Post')
        break
      case ActionType.COPY_POST_FARCASTER:
        communityActions[value].farcaster.unshift('Post')
        break
      case ActionType.DELETE_POST_TWITTER:
        communityActions[value].twitter.unshift('Delete')
        break
      case ActionType.DELETE_POST_FARCASTER:
        communityActions[value].farcaster.unshift('Delete')
        break
    }
  }

  return (
    <YStack gap="$2.5" theme="surface3" themeShallow br="$4">
      {Object.entries(communityActions)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([_, action], i) => (
          <CommunityActionItem
            key={i}
            chainId={community.chain_id}
            tokenAddress={community.token_address}
            action={action}
          />
        ))}
    </YStack>
  )
}

function CommunityActionItem({
  chainId,
  tokenAddress,
  action,
}: { chainId: number; tokenAddress: string; action: CommunityAction }) {
  const { data } = useToken({ chainId, address: tokenAddress })
  const { credentials } = useSDK()

  const symbol = data?.attributes.symbol
  const implementation = data?.attributes.implementations[0]
  const amount = Number.parseFloat(
    formatUnits(BigInt(action.value), implementation?.decimals ?? 18)
  )

  const labels = []
  if (action.twitter.length > 0) {
    labels.push(`${action.twitter.join('/')} on Twitter`)
  }
  if (action.farcaster.length > 0) {
    labels.push(`${action.farcaster.join('/')} on Farcaster`)
  }

  const credential = getUsableCredential(credentials.credentials, action.action)

  return (
    <XStack gap="$2" ai="center">
      {credential ? (
        <CircleCheck size={16} color="$green11" />
      ) : (
        <CircleX size={16} color="$red11" />
      )}
      <Text fos="$2" fow="500">{`${amount.toLocaleString()} ${symbol}`}</Text>
      <Text fos="$2" fow="400" color="$color11">
        {labels.join(', ')}
      </Text>
    </XStack>
  )
}

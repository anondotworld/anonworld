import { Separator, Text, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import {
  CredentialType,
  ERC20CredentialRequirement,
  ERC721CredentialRequirement,
  formatAddress,
  formatAmount,
} from '@anonworld/common'
import { formatEther, formatUnits } from 'viem'
import { useActions } from '../../../hooks/use-actions'
import { Action, ActionType, Community, getChain } from '@anonworld/common'
import { useCredentials } from '../../../providers'
import { getUsableCredential } from '@anonworld/common'
import { CircleCheck, CircleX } from '@tamagui/lucide-icons'
import { TokenImage } from '../../tokens/image'

export function CommunityToken({ community }: { community: Community }) {
  const chain = getChain(Number(community.token.chain_id))
  return (
    <YStack gap="$4" mt="$2" $xs={{ gap: '$2' }}>
      <XStack gap="$4" ai="center">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Token
        </Text>
        <Separator />
      </XStack>
      <XStack ai="center" jc="space-between">
        <YStack gap="$1" minWidth="$10">
          <XStack ai="center" gap="$2">
            <TokenImage token={community.token} />
            <Text fow="600">{community.token.symbol}</Text>
          </XStack>
          <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
            {`${chain.name} | ${formatAddress(community.token.address)}`}
          </Text>
        </YStack>
        <XStack
          gap="$4"
          ai="center"
          jc="flex-end"
          px="$4"
          fg={1}
          $xs={{ flexDirection: 'column', gap: '$2', px: '$2', ai: 'flex-end' }}
        >
          <Field
            label="Mkt Cap"
            value={`$${formatAmount(community.token.market_cap)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Price"
            value={`$${Number(community.token.price_usd).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Holders"
            value={formatAmount(community.token.holders)}
            minWidth="$10"
            ai="flex-end"
          />
        </XStack>
      </XStack>
      <CommunityActions community={community} />
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
    const credentialType = action.credential_id?.split(':')[0] as
      | CredentialType
      | undefined

    if (
      !action.community ||
      action.community.id !== community.id ||
      !action.credential_requirement ||
      !credentialType
    ) {
      continue
    }

    let value: number | undefined = undefined

    switch (credentialType) {
      case CredentialType.ERC20_BALANCE:
      case CredentialType.ERC721_BALANCE: {
        const credentialRequirement = action.credential_requirement as
          | ERC20CredentialRequirement
          | ERC721CredentialRequirement
          | undefined

        if (!credentialRequirement) {
          continue
        }

        value = Number.parseFloat(
          formatEther(BigInt(credentialRequirement.minimumBalance))
        )
        if (!communityActions[value]) {
          communityActions[value] = {
            value: credentialRequirement.minimumBalance,
            action,
            twitter: [],
            farcaster: [],
          }
        }
        break
      }
      default:
        continue
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

  if (Object.keys(communityActions).length === 0) {
    return null
  }

  return (
    <YStack gap="$2.5" theme="surface3" themeShallow br="$4" mt="$2">
      {Object.entries(communityActions)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([_, action], i) => (
          <CommunityActionItem key={i} action={action} />
        ))}
    </YStack>
  )
}

function CommunityActionItem({ action }: { action: CommunityAction }) {
  const { credentials } = useCredentials()

  const amount = Number.parseFloat(
    formatUnits(BigInt(action.value), action.action.community?.token.decimals ?? 18)
  )

  const labels = []
  if (action.twitter.length > 0) {
    labels.push(`${action.twitter.join('/')} on Twitter`)
  }
  if (action.farcaster.length > 0) {
    labels.push(`${action.farcaster.join('/')} on Farcaster`)
  }

  const credential = getUsableCredential(credentials, action.action)

  return (
    <XStack gap="$2" ai="center">
      {credential ? (
        <CircleCheck size={16} color="$green11" />
      ) : (
        <CircleX size={16} color="$red11" />
      )}
      <Text
        fos="$2"
        fow="500"
      >{`${amount.toLocaleString()} ${action.action.community?.token.symbol || ''}`}</Text>
      <Text fos="$2" fow="400" color="$color11">
        {labels.join(', ')}
      </Text>
    </XStack>
  )
}

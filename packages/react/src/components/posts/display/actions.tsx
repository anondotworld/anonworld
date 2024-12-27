import { MoreHorizontal, Trash } from '@tamagui/lucide-icons'
import { Popover, Text, View, YGroup, YStack } from '@anonworld/ui'
import { useActions } from '../../../hooks/use-actions'
import { Action, ActionType, Cast, CredentialRequirement } from '../../../types'
import { useSDK } from '../../../providers/sdk'
import { formatAmount, getUsableCredential } from '../../../utils'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { NamedExoticComponent } from 'react'
import { useFarcasterUser } from '../../../hooks/use-farcaster-user'
import { useExecuteActions, useToken } from '../../../hooks'
import { formatUnits } from 'viem/utils'

export function PostActions({ post }: { post: Cast }) {
  const { data } = useActions()
  const actions = data?.sort((a, b) => a.type.localeCompare(b.type))

  return (
    <Popover size="$5" placement="bottom">
      <Popover.Trigger
        onPress={(e) => {
          e.stopPropagation()
        }}
      >
        <View p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
          <MoreHorizontal size={20} />
        </View>
      </Popover.Trigger>
      <Popover.Content
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          '100ms',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
        cursor="pointer"
        bordered
        overflow="hidden"
        userSelect="none"
      >
        <YGroup>
          {actions?.map((action) => (
            <PostAction key={action.id} post={post} action={action} />
          ))}
        </YGroup>
      </Popover.Content>
    </Popover>
  )
}

function PostAction({ action, post }: { action: Action; post: Cast }) {
  switch (action.type) {
    case ActionType.COPY_POST_TWITTER: {
      const hasRelationship = post.relationships.some(
        (c) => c.targetAccount === action.metadata.twitter
      )
      if (hasRelationship) {
        return null
      }

      const isValidEq =
        !action.metadata.target.post.text.eq ||
        action.metadata.target.post.text.eq.some((text) =>
          post.text.toLowerCase().match(text)
        )
      const isValidNe =
        !action.metadata.target.post.text.ne ||
        !action.metadata.target.post.text.ne.some((text) =>
          post.text.toLowerCase().match(text)
        )

      if (!isValidEq || !isValidNe) {
        return null
      }

      return (
        <BasePostAction
          action={action}
          data={{ hash: post.hash }}
          Icon={X}
          label={`Post to @${action.metadata.twitter}`}
        />
      )
    }
    case ActionType.DELETE_POST_TWITTER: {
      const hasRelationship = post.relationships.some(
        (c) => c.targetAccount === action.metadata.twitter
      )
      if (!hasRelationship) {
        return null
      }

      return (
        <BasePostAction
          action={action}
          data={{ hash: post.hash }}
          Icon={Trash}
          label={`Delete from @${action.metadata.twitter}`}
          destructive
        />
      )
    }
    case ActionType.COPY_POST_FARCASTER:
    case ActionType.DELETE_POST_FARCASTER:
      return <PostActionFarcaster fid={action.metadata.fid} action={action} post={post} />
  }

  return null
}

function PostActionFarcaster({
  fid,
  action,
  post,
}: {
  fid: string
  action: Action
  post: Cast
}) {
  const { data } = useFarcasterUser(fid)

  switch (action.type) {
    case ActionType.COPY_POST_FARCASTER: {
      const hasRelationship = post.relationships.some(
        (c) => c.targetAccount === action.metadata.fid
      )
      if (hasRelationship) {
        return null
      }

      const validateEq =
        !action.metadata.target.post.text.eq ||
        action.metadata.target.post.text.eq?.some((text) =>
          post.text.toLowerCase().match(text)
        )
      const validateNe =
        !action.metadata.target.post.text.ne ||
        action.metadata.target.post.text.ne?.some(
          (text) => !post.text.toLowerCase().match(text)
        )

      if (!validateEq || !validateNe) {
        return null
      }

      return (
        <BasePostAction
          action={action}
          data={{ hash: post.hash }}
          Icon={Farcaster}
          label={`Post to @${data?.username}`}
        />
      )
    }
    case ActionType.DELETE_POST_FARCASTER: {
      const hasRelationship = post.relationships.some(
        (c) => c.targetAccount === action.metadata.fid
      )
      if (!hasRelationship) {
        return null
      }

      return (
        <BasePostAction
          action={action}
          data={{ hash: post.hash }}
          Icon={Trash}
          label={`Delete from @${data?.username}`}
          destructive
        />
      )
    }
  }

  return null
}

function BasePostAction({
  action,
  data,
  Icon,
  label,
  destructive,
}: {
  action: Action
  data: any
  Icon: NamedExoticComponent<any>
  label: string
  destructive?: boolean
}) {
  const { credentials } = useSDK()
  const credential = getUsableCredential(credentials.credentials, action)
  const { mutate } = useExecuteActions({
    credentials: credential ? [credential] : [],
    actions: [
      {
        actionId: action.id,
        data,
      },
    ],
  })

  return (
    <YGroup.Item>
      <View
        onPress={(e) => {
          e.stopPropagation()
          if (credential) {
            mutate()
          }
        }}
        fd="row"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={{ bg: '$color5' }}
      >
        {Icon && (
          <Icon
            size={16}
            color={destructive ? '$red9' : undefined}
            opacity={credential ? 1 : 0.5}
          />
        )}
        <YStack ai="flex-start" gap="$1">
          <Text
            fos="$2"
            fow="400"
            color={destructive ? '$red9' : undefined}
            opacity={credential ? 1 : 0.5}
          >
            {label}
          </Text>
          {!credential && action.credential_requirement && (
            <ERC20Requirement req={action.credential_requirement} />
          )}
        </YStack>
      </View>
    </YGroup.Item>
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
    <Text fos="$1" fow="500" color="$color10">
      {`req: ${formatAmount(amount)} ${symbol}`}
    </Text>
  )
}

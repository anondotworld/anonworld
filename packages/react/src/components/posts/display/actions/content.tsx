import { Eye, Trash } from '@tamagui/lucide-icons'
import { Spinner, Text, useToastController, View, YGroup, YStack } from '@anonworld/ui'
import { useActions } from '../../../../hooks/use-actions'
import { Action, ActionType, Cast, CredentialRequirement } from '../../../../types'
import { formatAmount, getUsableCredential } from '../../../../utils'
import { Farcaster } from '../../../svg/farcaster'
import { X } from '../../../svg/x'
import { NamedExoticComponent } from 'react'
import { useFarcasterUser } from '../../../../hooks/use-farcaster-user'
import { useExecuteActions } from '../../../../hooks'
import { formatUnits } from 'viem/utils'
import { useNewCredential } from '../../../credentials/new/context'
import { useCredentials } from '../../../../providers'

export function PostActionsContent({
  post,
  setPostRevealOpen,
}: {
  post: Cast
  setPostRevealOpen: (open: boolean) => void
}) {
  const { data } = useActions()
  const actions = data
    ?.sort((a, b) => a.type.localeCompare(b.type))
    .filter((action) =>
      post.credentials.some(
        (credential) => credential.credential_id === action.credential_id
      )
    )

  const hasActions = actions && actions.length > 0
  const hasReveal = post.reveal && !post.reveal.phrase

  return (
    <YGroup>
      {!hasActions && !hasReveal && (
        <YGroup.Item>
          <View fd="row" gap="$2" px="$3.5" py="$2.5">
            <Text fos="$2" fow="400" color="$color11">
              No actions
            </Text>
          </View>
        </YGroup.Item>
      )}
      {hasActions &&
        actions?.map((action) => (
          <PostAction key={action.id} post={post} action={action} />
        ))}
      {hasReveal && (
        <YGroup.Item>
          <View
            fd="row"
            gap="$2"
            px="$3.5"
            py="$2.5"
            hoverStyle={{ bg: '$color5' }}
            onPress={() => setPostRevealOpen(true)}
          >
            <Eye size={16} />
            <YStack ai="flex-start" gap="$1">
              <Text fos="$2" fow="400">
                Reveal Post
              </Text>
            </YStack>
          </View>
        </YGroup.Item>
      )}
    </YGroup>
  )
}

function PostAction({ action, post }: { action: Action; post: Cast }) {
  switch (action.type) {
    case ActionType.COPY_POST_TWITTER: {
      return <CopyPostTwitter action={action} post={post} />
    }
    case ActionType.DELETE_POST_TWITTER: {
      return <DeletePostTwitter action={action} post={post} />
    }
    case ActionType.COPY_POST_FARCASTER: {
      if (!action.metadata) return null
      return <CopyPostFarcaster fid={action.metadata.fid} action={action} post={post} />
    }
    case ActionType.DELETE_POST_FARCASTER: {
      if (!action.metadata) return null
      return <DeletePostFarcaster fid={action.metadata.fid} action={action} post={post} />
    }
  }

  return null
}

function DeletePostTwitter({
  action,
  post,
}: {
  action: Action
  post: Cast
}) {
  if (action.type !== ActionType.DELETE_POST_TWITTER) {
    return null
  }

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
      successMessage={`Deleted from @${action.metadata.twitter}`}
    />
  )
}

function CopyPostTwitter({
  action,
  post,
}: {
  action: Action
  post: Cast
}) {
  if (action.type !== ActionType.COPY_POST_TWITTER) {
    return null
  }

  const hasRelationship = post.relationships.some(
    (c) => c.targetAccount === action.metadata.twitter
  )
  if (hasRelationship) {
    return null
  }

  const isValidEq =
    !action.metadata.target?.post.text.eq ||
    action.metadata.target?.post.text.eq.some((text) =>
      post.text.toLowerCase().match(text)
    )
  const isValidNe =
    !action.metadata.target?.post.text.ne ||
    !action.metadata.target?.post.text.ne.some((text) =>
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
      successMessage={`Posted to @${action.metadata.twitter}`}
    />
  )
}

function DeletePostFarcaster({
  fid,
  action,
  post,
}: {
  fid: number
  action: Action
  post: Cast
}) {
  const { data } = useFarcasterUser(fid)

  if (action.type !== ActionType.DELETE_POST_FARCASTER) {
    return null
  }

  const hasRelationship = post.relationships.some(
    (c) => c.targetAccount === action.metadata.fid.toString()
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
      successMessage={`Deleted from @${data?.username}`}
    />
  )
}

function CopyPostFarcaster({
  fid,
  action,
  post,
}: {
  fid: number
  action: Action
  post: Cast
}) {
  const { data } = useFarcasterUser(fid)

  if (action.type !== ActionType.COPY_POST_FARCASTER) {
    return null
  }

  const hasRelationship = post.relationships.some(
    (c) => c.targetAccount === action.metadata.fid.toString()
  )
  if (hasRelationship) {
    return null
  }

  const validateEq =
    !action.metadata.target?.post.text.eq ||
    action.metadata.target?.post.text.eq?.some((text) =>
      post.text.toLowerCase().match(text)
    )
  const validateNe =
    !action.metadata.target?.post.text.ne ||
    action.metadata.target?.post.text.ne?.some(
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
      successMessage={`Posted to @${data?.username}`}
    />
  )
}

function BasePostAction({
  action,
  data,
  Icon,
  label,
  destructive,
  successMessage,
}: {
  action: Action
  data: any
  Icon: NamedExoticComponent<any>
  label: string
  destructive?: boolean
  successMessage: string
}) {
  const { setIsOpen } = useNewCredential()
  const { credentials } = useCredentials()
  const credential = getUsableCredential(credentials, action)
  const toast = useToastController()
  const { mutate, isPending } = useExecuteActions({
    credentials: credential ? [credential] : [],
    actions: [
      {
        actionId: action.id,
        data,
      },
    ],
    onSuccess: (data) => {
      toast.show(successMessage, {
        duration: 3000,
      })
    },
  })

  return (
    <YGroup.Item>
      <View
        onPress={(e) => {
          if (isPending) return
          if (credential) {
            mutate()
          } else {
            setIsOpen(true)
          }
        }}
        fd="row"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={{ bg: '$color5' }}
        ai={!credential && action.credential_requirement ? 'flex-start' : 'center'}
      >
        {isPending && <Spinner color="$color12" />}
        {Icon && !isPending && (
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
            <ERC20Requirement action={action} req={action.credential_requirement} />
          )}
        </YStack>
      </View>
    </YGroup.Item>
  )
}

function ERC20Requirement({
  action,
  req,
}: {
  action: Action
  req: CredentialRequirement
}) {
  const symbol = action.community?.token.symbol
  const amount = Number.parseFloat(
    formatUnits(BigInt(req.minimumBalance), action.community?.token.decimals ?? 18)
  )

  return (
    <Text fos="$1" fow="500" color="$color10">
      {`req: ${formatAmount(amount)} ${symbol}`}
    </Text>
  )
}

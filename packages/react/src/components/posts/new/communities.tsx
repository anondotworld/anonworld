import { Image, Popover, ScrollView, Text, XStack } from '@anonworld/ui'
import { Action, ActionType } from '../../../types'
import { useNewPost } from './context'
import { Badge } from '../../badge'
import { useEffect, useMemo, useState } from 'react'
import { useActions } from '../../../hooks/use-actions'
import { formatAmount, getUsableCredential } from '../../../utils'

export function NewPostCommunities() {
  const { credentials, setCopyActions } = useNewPost()
  const { data } = useActions()

  const actions = useMemo(() => {
    return (
      data?.filter((action) => {
        return getUsableCredential(credentials, action)
      }) ?? []
    )
  }, [data, credentials])

  useEffect(() => {
    setCopyActions(actions)
  }, [actions])

  if (actions.length === 0) return null

  const actionsByToken = actions.reduce(
    (acc, action) => {
      if (!action.community?.token || action.type !== ActionType.COPY_POST_FARCASTER)
        return acc
      if (!acc[action.community.token.address]) {
        acc[action.community.token.address] = []
      }
      acc[action.community.token.address].push(action)
      return acc
    },
    {} as Record<string, Action[]>
  )

  return (
    <XStack gap="$2" jc="flex-end" ai="center">
      <Text fos="$1" fow="500" col="$color11">
        Sharing to:
      </Text>
      {Object.values(actionsByToken).map((tokenActions, index) => {
        return <CopyActionSelector key={index} actions={tokenActions} />
      })}
    </XStack>
  )
}

function CopyActionSelector({ actions }: { actions: Action[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const { copyActions, setCopyActions } = useNewPost()
  const copyAction = copyActions.find((action) => action.community)
  if (!copyAction?.community) return null

  return (
    <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Badge
          icon={<Image src={copyAction.community.image_url} w={12} h={12} br="$12" />}
        >
          {`${copyAction.community.name} `}
          <Text fos="$1" col="$color11">
            {formatAmount(copyAction.community.followers)}
          </Text>
        </Badge>
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
        ai="flex-start"
      >
        <XStack gap="$2" ai="center" p="$2">
          {copyAction.community.token.image_url && (
            <Image src={copyAction.community.token.image_url} w={16} h={16} />
          )}
          <Text fos="$1" fow="500" color="$color11">
            {`${copyAction.community.token.symbol} Communities`}
          </Text>
        </XStack>
        <ScrollView maxHeight="$14">
          {actions.map((action) => (
            <XStack
              key={action.id}
              gap="$2"
              ai="center"
              p="$2"
              hoverStyle={{ bg: '$color5' }}
              bc="$borderColor"
              btw="$0.5"
              onPress={() => {
                let index = copyActions.findIndex((a) => a.id === copyAction.id)
                setCopyActions((prev) => {
                  let next = [...prev]
                  next.splice(index, 0, action)
                  return next
                })
                setIsOpen(false)
              }}
              jc="space-between"
            >
              <XStack gap="$2" ai="center">
                {action.community?.image_url && (
                  <Image src={action.community?.image_url} w={16} h={16} />
                )}
                <Text fos="$2" fow="600">
                  {action.community?.name}
                </Text>
              </XStack>
              <Text fos="$1" col="$color11">
                {`${formatAmount(action.community?.followers ?? 0)} followers`}
              </Text>
            </XStack>
          ))}
        </ScrollView>
      </Popover.Content>
    </Popover>
  )
}

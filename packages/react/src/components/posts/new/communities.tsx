import { Image, Text, XStack } from '@anonworld/ui'
import { Action, ActionType } from '../../../types'
import { useNewPost } from './context'
import { Badge } from '../../badge'
import { useEffect, useMemo } from 'react'
import { useActions } from '../../../hooks/use-actions'
import { getUsableCredential } from '../../../utils'

export function NewPostCommunities() {
  const { credentials, setCopyActions } = useNewPost()
  const { data } = useActions()

  const actions = useMemo(() => {
    return (
      data?.filter((action) => {
        return action.trigger && getUsableCredential(credentials, action)
      }) ?? []
    )
  }, [data, credentials])

  useEffect(() => {
    setCopyActions(actions)
  }, [actions])

  if (actions.length === 0) return null

  const actionsByToken = actions.reduce(
    (acc, action) => {
      if (!action.community) return acc
      acc[action.community.token.address] = action
      return acc
    },
    {} as Record<string, Action>
  )

  return (
    <XStack gap="$2" jc="flex-end" ai="center">
      <Text fos="$1" fow="500" col="$color11">
        Sharing to:
      </Text>
      {Object.values(actionsByToken).map((action) => {
        if (!action.community) return null
        if (
          action.type === ActionType.COPY_POST_FARCASTER ||
          action.type === ActionType.COPY_POST_TWITTER
        ) {
          return (
            <Badge
              key={action.id}
              icon={<Image src={action.community?.image_url} w={12} h={12} br="$12" />}
            >
              {action.community.name}
            </Badge>
          )
        }

        return null
      })}
    </XStack>
  )
}

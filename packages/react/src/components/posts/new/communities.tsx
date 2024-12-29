import { Text, XStack } from '@anonworld/ui'
import { useActions } from '../../../hooks/use-actions'
import { ActionType } from '../../../types'
import { useNewPost } from './context'
import { getUsableCredential } from '../../../utils'
import { useFarcasterUser } from '../../../hooks/use-farcaster-user'
import { Badge } from '../../badge'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'

export function NewPostCommunities() {
  const { data } = useActions()
  const { credentials } = useNewPost()
  const actions = data?.filter((action) => action.trigger)

  const relevantActions =
    actions?.filter((action) => {
      const credential = getUsableCredential(credentials, action)
      return credential
    }) ?? []

  if (relevantActions.length === 0) return null

  return (
    <XStack gap="$2" jc="flex-end" ai="center">
      <Text fos="$1" fow="500" col="$color11">
        Sharing to:
      </Text>
      {relevantActions.map((action) => {
        if (action.type === ActionType.COPY_POST_FARCASTER) {
          return <FarcasterBadge key={action.id} fid={action.metadata.fid} />
        }

        if (action.type === ActionType.COPY_POST_TWITTER) {
          return <TwitterBadge key={action.id} twitter={action.metadata.twitter} />
        }

        return null
      })}
    </XStack>
  )
}

function FarcasterBadge({ fid }: { fid: number }) {
  const { data } = useFarcasterUser(fid)
  return <Badge icon={<Farcaster size={12} />}>{data?.username}</Badge>
}

function TwitterBadge({ twitter }: { twitter: string }) {
  return (
    <Badge
      onPress={() => {
        window.open(`https://x.com/${twitter}`, '_blank')
      }}
      icon={<X size={10} />}
    >
      {twitter}
    </Badge>
  )
}

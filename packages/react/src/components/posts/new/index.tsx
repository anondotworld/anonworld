import { Button, Text, XStack } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { NewPostProvider } from './context'
import { NewPostDialog } from './dialog'
import { Plus } from '@tamagui/lucide-icons'
import { ActionType, Community } from '../../../types'
import { useActions } from '../../../hooks/use-actions'
import { useSDK } from '../../../providers'
import { getUsableCredential } from '../../../utils'

function NewPostButton() {
  return (
    <Dialog.Trigger asChild>
      <Button
        size="$3"
        themeInverse
        bg="$background"
        br="$12"
        bw="$0"
        hoverStyle={{ opacity: 0.9 }}
      >
        <XStack ai="center" gap="$2">
          <Plus size={16} strokeWidth={2.5} />
          <Text fos="$2" fow="600">
            Create Post
          </Text>
        </XStack>
      </Button>
    </Dialog.Trigger>
  )
}

export function NewPost({ onSuccess }: { onSuccess: (hash: string) => void }) {
  return (
    <NewPostProvider onSuccess={onSuccess}>
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

export function NewCommunityPost({
  onSuccess,
  community,
}: {
  onSuccess: (hash: string) => void
  community: Community
}) {
  const { data: actions } = useActions()
  const { credentials } = useSDK()

  const relevantAction = actions?.find((action) => {
    if (
      action.type === ActionType.COPY_POST_FARCASTER &&
      action.metadata.fid === community.fid
    ) {
      return action
    }

    return null
  })

  const credential = relevantAction
    ? getUsableCredential(credentials.credentials, relevantAction)
    : null

  return (
    <NewPostProvider
      onSuccess={onSuccess}
      initialCredentials={credential ? [credential] : undefined}
    >
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

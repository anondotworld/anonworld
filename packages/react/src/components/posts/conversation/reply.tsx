import { XStack } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { Cast } from '../../../types'
import { Text } from '@anonworld/ui'
import { NewPostProvider } from '../new/context'
import { NewPostDialog } from '../new/dialog'
import { MessageCircle, MessageSquare } from '@tamagui/lucide-icons'

export function ReplyButton({ post }: { post: Cast }) {
  const handleSuccess = (hash: string) => {
    window.location.reload()
  }

  return (
    <NewPostProvider
      onSuccess={handleSuccess}
      initialReply={{
        url: `https://warpcast.com/${post.author.username}/${post.hash.slice(0, 10)}`,
        type: 'farcaster',
      }}
    >
      <NewPostDialog>
        <Dialog.Trigger asChild>
          <XStack
            py="$2"
            px="$3"
            br="$12"
            hoverStyle={{ bg: '$color5' }}
            gap="$2"
            cursor="pointer"
            ai="center"
          >
            <MessageCircle size={16} col="$color11" />
            <Text fos="$2" col="$color11">
              Reply
            </Text>
          </XStack>
        </Dialog.Trigger>
      </NewPostDialog>
    </NewPostProvider>
  )
}

export function ReplyBar({ post }: { post: Cast }) {
  const handleSuccess = (hash: string) => {
    window.location.reload()
  }

  return (
    <NewPostProvider
      onSuccess={handleSuccess}
      initialReply={{
        url: `https://warpcast.com/${post.author.username}/${post.hash.slice(0, 10)}`,
        type: 'farcaster',
      }}
    >
      <NewPostDialog>
        <Dialog.Trigger asChild>
          <XStack
            bg="$color3"
            bc="$color6"
            bw="$0.5"
            p="$3"
            gap="$3"
            br="$4"
            f={1}
            ai="center"
            group
            cursor="pointer"
            hoverStyle={{ bg: '$color4' }}
          >
            <MessageSquare size={16} col="$color11" $group-hover={{ col: '$color12' }} />
            <Text fos="$2" col="$color11" $group-hover={{ col: '$color12' }}>
              Add comment...
            </Text>
          </XStack>
        </Dialog.Trigger>
      </NewPostDialog>
    </NewPostProvider>
  )
}

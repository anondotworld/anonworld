import { NewPostDialog } from '../new/dialog'
import { NewPostProvider } from '../new/context'
import { Post } from '@anonworld/common'
import { XStack, Text, Dialog, View } from '@anonworld/ui'
import { MessageCircle } from '@tamagui/lucide-icons'
import { formatAmount } from '../../../utils'
import { ActionButton, variants } from './button'

export function ReplyButton({
  post,
  variant = 'default',
}: { post: Post; showCount?: boolean; variant?: keyof typeof variants }) {
  return (
    <View onPress={(e) => e.preventDefault()}>
      <NewPostProvider
        initialReply={{
          url: `https://warpcast.com/${post.author.username}/${post.hash.slice(0, 10)}`,
          type: 'farcaster',
        }}
      >
        <NewPostDialog>
          <Dialog.Trigger>
            <ActionButton variant={variant} Icon={MessageCircle}>
              {variant === 'default'
                ? formatAmount(post.aggregate?.replies ?? post.replies.count)
                : 'Reply'}
            </ActionButton>
          </Dialog.Trigger>
        </NewPostDialog>
      </NewPostProvider>
    </View>
  )
}

export function ReplyBar({ post }: { post: Post }) {
  return (
    <NewPostProvider
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
            $xs={{ mx: '$2' }}
          >
            <MessageCircle size={16} col="$color11" $group-hover={{ col: '$color12' }} />
            <Text fos="$2" col="$color11" $group-hover={{ col: '$color12' }}>
              Add comment...
            </Text>
          </XStack>
        </Dialog.Trigger>
      </NewPostDialog>
    </NewPostProvider>
  )
}

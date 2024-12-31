import { NewPostDialog } from '../new/dialog'
import { NewPostProvider } from '../new/context'
import { Cast } from '../../../types'
import { XStack, Text, Dialog, View } from '@anonworld/ui'
import { MessageCircle } from '@tamagui/lucide-icons'
import { formatAmount } from '../../../utils'

export function ReplyButton({
  post,
  showCount = false,
  color = '$color12',
  bg = '$color4',
  bgHover = '$color5',
}: { post: Cast; showCount?: boolean; color?: string; bg?: string; bgHover?: string }) {
  return (
    <View onPress={(e) => e.preventDefault()}>
      <NewPostProvider
        initialReply={{
          url: `https://warpcast.com/${post.author.username}/${post.hash.slice(0, 10)}`,
          type: 'farcaster',
        }}
      >
        <NewPostDialog>
          <Dialog.Trigger asChild>
            <XStack
              ai="center"
              gap="$2"
              bg={bg}
              br="$12"
              px="$2.5"
              py="$2"
              hoverStyle={{ bg: bgHover }}
              cursor="pointer"
            >
              <MessageCircle size={14} col={color} />
              {showCount ? (
                <Text fos="$1" col={color}>
                  {formatAmount(post.aggregate?.replies ?? post.replies.count)}
                </Text>
              ) : (
                <Text fos="$1" col={color}>
                  Reply
                </Text>
              )}
            </XStack>
          </Dialog.Trigger>
        </NewPostDialog>
      </NewPostProvider>
    </View>
  )
}

export function ReplyBar({ post }: { post: Cast }) {
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

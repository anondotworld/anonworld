import { ConversationCast } from '@anonworld/react'
import { Avatar, Dialog, Separator, Text, View, XStack, YStack } from '@anonworld/ui'
import { MessageCircle } from '@tamagui/lucide-icons'
import { formatAmount } from '../../../utils'
import { PostEmbed } from '../display/embeds'
import { timeAgo } from '../../../utils'
import { Heart } from '@tamagui/lucide-icons'
import { PostActions } from './actions'
import { NewPostProvider } from '../new/context'
import { NewPostDialog } from '../new/dialog'

export function PostConversation({
  conversation,
}: {
  conversation: Array<ConversationCast>
}) {
  return (
    <YStack gap="$4">
      {conversation.map((post, index) => (
        <Post
          key={post.hash}
          post={post}
          depth={0}
          isLastChild={index === conversation.length - 1}
        />
      ))}
    </YStack>
  )
}

function Post({
  post,
  depth,
  isLastChild,
}: {
  post: ConversationCast
  depth: number
  isLastChild: boolean
}) {
  let text = post.text
  if (post.embeds) {
    for (const embed of post.embeds) {
      if (embed.url) {
        text = text.replace(embed.url, '')
      }
    }
  }

  return (
    <YStack>
      <XStack>
        {Array.from({ length: depth }).map((_, index) => {
          const isEndOfRow = index === depth - 1
          const isContinuation = !isLastChild && index === depth - 1
          return (
            <View key={index} w={32} jc="flex-end" flexDirection="row">
              {isContinuation && (
                <View
                  bc="$borderColor"
                  brw="$0.75"
                  w={14.5}
                  h="100%"
                  pos="absolute"
                  top="$0"
                  left="$0"
                  right="$0"
                />
              )}
              {isEndOfRow && (
                <View bblr="$6" bc="$borderColor" blw="$0.75" bbw="$0.75" h={24} w={19} />
              )}
            </View>
          )
        })}
        <XStack gap="$2.5" ai="center" pt="$2">
          <View w={32} ai="center">
            <Avatar size="$2.5" circular>
              <Avatar.Image src={post.author.pfp_url} />
              <Avatar.Fallback />
            </Avatar>
          </View>
          <Text
            fow="600"
            fos="$2"
            cursor="pointer"
            onPress={() =>
              window.open(`https://warpcast.com/${post.author.username}`, '_blank')
            }
            hoverStyle={{ textDecorationLine: 'underline' }}
          >
            {post.author.username}
          </Text>
          <Text fos="$2" fow="400" col="$color11">
            {timeAgo(post.timestamp)}
          </Text>
        </XStack>
      </XStack>
      <XStack gap="$2.5">
        <XStack>
          {Array.from({ length: depth + 1 }).map((_, index) => {
            const isEndOfRow = index === depth
            const isEndOfConversation =
              !post.direct_replies || post.direct_replies.length === 0
            const isContinuation = !isLastChild && index === depth - 1
            return (
              <View key={index} w={32} ai="flex-end">
                {((isEndOfRow && !isEndOfConversation) || isContinuation) && (
                  <View bc="$borderColor" blw="$0.75" f={1} w={19} />
                )}
              </View>
            )
          })}
        </XStack>
        <YStack gap="$2" f={1}>
          <Text lineHeight={22}>{text}</Text>
          {post.embeds?.map((embed) => (
            <PostEmbed key={embed.url} embed={embed} />
          ))}
          <XStack ai="center" ml="$-3">
            <XStack
              py="$2"
              px="$3"
              br="$12"
              hoverStyle={{ bg: '$color5' }}
              gap="$2"
              ai="center"
              cursor="pointer"
            >
              <Heart size={16} col="$color11" />
              <Text fos="$2" col="$color11">
                {formatAmount(post.aggregate?.likes ?? post.reactions.likes_count)}
              </Text>
            </XStack>
            <ReplyButton post={post} />
            <PostActions post={post} />
          </XStack>
        </YStack>
      </XStack>
      {post.direct_replies?.map((reply, index) => (
        <Post
          key={reply.hash}
          post={reply}
          depth={depth + 1}
          isLastChild={index === post.direct_replies.length - 1}
        />
      ))}
    </YStack>
  )
}

function ReplyButton({ post }: { post: ConversationCast }) {
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

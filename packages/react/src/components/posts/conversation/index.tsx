import { ConversationCast, CredentialBadge, VaultBadge } from '@anonworld/react'
import { Avatar, Text, View, XStack, YStack } from '@anonworld/ui'
import { formatAmount } from '../../../utils'
import { PostEmbed } from '../display/embeds'
import { timeAgo } from '../../../utils'
import { Heart } from '@tamagui/lucide-icons'
import { PostActions } from './actions'
import { ReplyButton } from '../actions/reply'
import { VaultAvatar } from '../../vaults/avatar'
import { Link, TextLink } from 'solito/link'
import { LikeButton } from '../actions/like'

export function PostConversation({
  conversation,
}: {
  conversation: Array<ConversationCast>
}) {
  return (
    <YStack gap="$4" $xs={{ px: '$2' }}>
      {conversation.map((post, index) => (
        <Post
          key={post.hash}
          post={post}
          arr={
            post.direct_replies && post.direct_replies.length > 0
              ? ['continue']
              : ['empty']
          }
        />
      ))}
    </YStack>
  )
}

function Post({
  post,
  arr,
}: {
  post: ConversationCast
  arr: Array<'continue' | 'empty'>
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
        {arr.slice(0, arr.length - 1).map((state, index) => {
          return (
            <View key={index} w={32} jc="flex-end" flexDirection="row">
              {state === 'continue' && (
                <View
                  bc="$borderColor"
                  brw="$0.5"
                  w={16}
                  h="100%"
                  pos="absolute"
                  top="$0"
                  left="$0"
                  right="$0"
                />
              )}
              {arr.length > 1 && index === arr.length - 2 && (
                <View bblr="$6" bc="$borderColor" blw="$0.5" bbw="$0.5" h={24} w={17} />
              )}
            </View>
          )
        })}
        <XStack gap="$2.5" ai="center" pt="$2">
          {post.credentials && post.credentials.length > 0 && (
            <>
              <View w={32} ai="center">
                <VaultAvatar
                  id={post.credentials[0].vault_id ?? post.credentials[0].displayId}
                  size="$2.5"
                />
              </View>
              <XStack gap="$2" ai="center">
                {post.credentials[0].vault_id && (
                  <Link href={`/profiles/${post.credentials[0].vault_id}`}>
                    <VaultBadge vaultId={post.credentials[0].vault_id} />
                  </Link>
                )}
                {post.credentials.map((credential, index) => (
                  <CredentialBadge key={index} credential={credential} />
                ))}
                <Text fos="$2" fow="400" col="$color11">
                  {timeAgo(post.timestamp)}
                </Text>
              </XStack>
            </>
          )}
          {(!post.credentials || post.credentials.length === 0) && (
            <>
              <View w={32} ai="center">
                <Avatar size="$2.5" circular>
                  <Avatar.Image src={post.author.pfp_url} />
                  <Avatar.Fallback />
                </Avatar>
              </View>
              <XStack gap="$2" ai="center">
                <TextLink
                  href={`https://warpcast.com/${post.author.username}`}
                  target="_blank"
                >
                  <Text
                    fow="600"
                    fos="$2"
                    cursor="pointer"
                    hoverStyle={{ textDecorationLine: 'underline' }}
                  >
                    {post.author.username}
                  </Text>
                </TextLink>
                <Text fos="$2" fow="400" col="$color11">
                  {timeAgo(post.timestamp)}
                </Text>
              </XStack>
            </>
          )}
        </XStack>
      </XStack>
      <XStack gap="$2.5">
        <XStack>
          {arr.map((state, index) => {
            return (
              <View key={index} w={32} ai="flex-end">
                {state === 'continue' && (
                  <View bc="$borderColor" blw="$0.5" f={1} w={17} />
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
          <XStack ai="center" ml="$-3" gap="$2">
            <LikeButton post={post} variant="conversation" />
            <ReplyButton post={post} variant="conversation" />
            <PostActions post={post} />
          </XStack>
        </YStack>
      </XStack>
      {post.direct_replies?.map((reply, index) => {
        const newArr = [...arr]
        if (reply.direct_replies && reply.direct_replies.length > 0) {
          newArr.push('continue')
        } else {
          newArr.push('empty')
        }
        if (index === post.direct_replies.length - 1) {
          newArr[newArr.length - 2] = 'empty'
        }
        return <Post key={reply.hash} post={reply} arr={newArr} />
      })}
    </YStack>
  )
}

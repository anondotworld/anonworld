'use client'

import {
  Post,
  PostConversation,
  ReplyBar,
  usePost,
  usePostConversation,
} from '@anonworld/react'
import { View, YStack, Spinner } from '@anonworld/ui'

export default function PostPage({ params }: { params: { hash: string } }) {
  const { data: post } = usePost({ hash: params.hash })
  const { data: conversation, isLoading: conversationLoading } = usePostConversation({
    hash: params.hash,
  })

  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$6">
      <YStack gap="$3">
        {post && (
          <View $xs={{ bbw: '$0.5', bc: '$borderColor' }}>
            <Post post={post} />
          </View>
        )}
        {post && <ReplyBar post={post} />}
      </YStack>
      {conversationLoading && <Spinner color="$color12" />}
      {conversation && <PostConversation conversation={conversation} />}
    </View>
  )
}

'use client'

import {
  Post,
  PostConversation,
  ReplyBar,
  usePost,
  usePostConversation,
} from '@anonworld/react'
import { View, YStack } from '@anonworld/ui'

export default function PostPage({ params }: { params: { hash: string } }) {
  const { data: post } = usePost({ hash: params.hash })
  const { data: conversation } = usePostConversation({ hash: params.hash })

  return (
    <View maxWidth={700} mx="auto" my="$4" gap="$6">
      <YStack gap="$3">
        {post && <Post post={post} />}
        {post && <ReplyBar post={post} />}
      </YStack>
      {conversation && <PostConversation conversation={conversation} />}
    </View>
  )
}

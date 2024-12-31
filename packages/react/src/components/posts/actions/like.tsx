import { Cast } from '../../../types'
import { XStack, Text, View, Dialog, useTheme } from '@anonworld/ui'
import { Heart } from '@tamagui/lucide-icons'
import { formatAmount } from '../../../utils'
import { AuthLogin } from '../../auth/login'
import { useSDK } from '../../..'
import { useMemo, useState } from 'react'

export function LikeButton({
  post,
  color = '$color12',
  bg = '$color4',
  bgHover = '$color5',
}: {
  post: Cast
  color?: string
  bg?: string
  bgHover?: string
}) {
  const { auth } = useSDK()
  const [isLiked, setIsLiked] = useState(false)

  if (!auth.passkeyId) {
    return (
      <View onPress={(e) => e.stopPropagation()}>
        <AuthLogin>
          <Dialog.Trigger>
            <LikeTrigger post={post} color={color} bg={bg} bgHover={bgHover} />
          </Dialog.Trigger>
        </AuthLogin>
      </View>
    )
  }

  return (
    <LikeTrigger
      post={post}
      color={color}
      bg={bg}
      bgHover={bgHover}
      onPress={() => setIsLiked(!isLiked)}
      isLiked={isLiked}
    />
  )
}

function LikeTrigger({
  post,
  color,
  bg,
  bgHover,
  onPress,
  isLiked,
}: {
  post: Cast
  color?: string
  bg?: string
  bgHover?: string
  onPress?: () => void
  isLiked?: boolean
}) {
  const theme = useTheme()

  const likes = useMemo(() => {
    const likes = isLiked ? 1 : 0
    if (post.aggregate?.likes) {
      return post.aggregate.likes + likes
    }
    return post.reactions.likes_count + likes
  }, [post.aggregate?.likes, post.reactions.likes_count, isLiked])

  return (
    <XStack
      ai="center"
      gap="$2"
      bg={bg}
      br="$12"
      px="$2.5"
      py="$2"
      hoverStyle={{ bg: bgHover }}
      cursor="pointer"
      onPress={onPress}
    >
      <Heart
        size={14}
        fill={isLiked ? theme.red11.val : undefined}
        col={isLiked ? theme.red11.val : color}
      />
      <Text fos="$1" col={color}>
        {formatAmount(likes)}
      </Text>
    </XStack>
  )
}

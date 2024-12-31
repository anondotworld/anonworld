import { Cast } from '../../../types'
import { View, Dialog, useTheme } from '@anonworld/ui'
import { Heart } from '@tamagui/lucide-icons'
import { formatAmount } from '../../../utils'
import { AuthLogin } from '../../auth/login'
import { useAuth, useSDK } from '../../..'
import { useMemo, useState } from 'react'
import { ActionButton, variants } from './button'

export function LikeButton({
  post,
  variant = 'default',
}: {
  post: Cast
  variant?: keyof typeof variants
}) {
  const { sdk } = useSDK()
  const { passkeyId } = useAuth()
  const [isLiked, setIsLiked] = useState(!!post.user?.liked)
  const theme = useTheme()

  const toggleLike = async () => {
    setIsLiked(!isLiked)

    if (isLiked) {
      const res = await sdk.unlikePost(post.hash)
      if (res.error) {
        setIsLiked(true)
      }
    } else {
      const res = await sdk.likePost(post.hash)
      if (res.error) {
        setIsLiked(false)
      }
    }
  }

  const likes = useMemo(() => {
    const likes = post.aggregate?.likes ?? post.reactions.likes_count ?? 0
    let offset = 0
    if (post.user?.liked && !isLiked) {
      offset = -1
    } else if (!post.user?.liked && isLiked) {
      offset = 1
    }
    return formatAmount(likes + offset)
  }, [post.aggregate?.likes, post.reactions.likes_count, isLiked])

  if (!passkeyId) {
    return (
      <View onPress={(e) => e.stopPropagation()}>
        <AuthLogin>
          <Dialog.Trigger>
            <ActionButton variant={variant} Icon={Heart}>
              {likes}
            </ActionButton>
          </Dialog.Trigger>
        </AuthLogin>
      </View>
    )
  }

  return (
    <View onPress={(e) => e.preventDefault()}>
      <ActionButton
        variant={variant}
        Icon={Heart}
        onPress={toggleLike}
        iconFocus={isLiked ? theme.red11.val : undefined}
      >
        {likes}
      </ActionButton>
    </View>
  )
}

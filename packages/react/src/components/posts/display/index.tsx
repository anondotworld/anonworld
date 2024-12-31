import { Cast, Reveal } from '../../../types'
import { formatAddress, formatAmount, timeAgo } from '../../../utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Text,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { Heart, MessageSquare } from '@tamagui/lucide-icons'
import { PostEmbed } from './embeds'
import { Badge } from '../../badge'
import { useFarcasterIdentity } from '../../../hooks/use-farcaster-identity'
import { PostActions } from './actions'
import { PostCommunities } from './communities'
import { PostCredential } from './credential'
import { VaultBadge } from '../../auth/vault'

export function Post({ post, onPress }: { post: Cast; onPress?: () => void }) {
  let text = post.text
  if (post.embeds) {
    for (const embed of post.embeds) {
      if (embed.url) {
        text = text.replace(embed.url, '')
      }
    }
  }

  return (
    <YStack
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bbw="$0.5"
      p="$3"
      gap="$4"
      $gtXs={{
        br: '$4',
        bw: '$0.5',
      }}
      onPress={onPress}
      hoverStyle={onPress ? { bg: '$color3' } : {}}
      cursor={onPress ? 'pointer' : undefined}
      f={1}
    >
      <XStack gap="$2" ai="center" onPress={(e) => e.stopPropagation()}>
        {post.credentials?.[0]?.vault && (
          <VaultBadge vault={post.credentials?.[0]?.vault} />
        )}
        {post.credentials?.map((credential, index) => (
          <PostCredential key={index} credential={credential} />
        ))}
      </XStack>
      <Text lineHeight={22}>{text}</Text>
      {post.embeds?.map((embed, index) => (
        <PostEmbed key={index} embed={embed} />
      ))}
      <XStack jc="space-between" ai="center">
        <XStack ai="center" gap="$2">
          <Badge>{timeAgo(post.timestamp)}</Badge>
          <Badge icon={<Heart size={12} />}>
            {formatAmount(post.aggregate?.likes ?? post.reactions.likes_count)}
          </Badge>
          <Badge icon={<MessageSquare size={12} />}>
            {formatAmount(post.aggregate?.replies ?? post.replies.count)}
          </Badge>
          {post.reveal?.phrase && <RevealBadge reveal={post.reveal} />}
        </XStack>
        {post.relationships.length > 0 && (
          <View onPress={(e) => e.stopPropagation()}>
            <PostCommunities post={post} />
          </View>
        )}
      </XStack>
      <View position="absolute" top="$2" right="$3" onPress={(e) => e.stopPropagation()}>
        <PostActions post={post} />
      </View>
    </YStack>
  )
}

function RevealBadge({ reveal }: { reveal: Reveal }) {
  const { data } = useFarcasterIdentity(reveal.address!)
  return (
    <Badge
      icon={
        <Avatar size={16} circular>
          <AvatarImage src={data?.pfp_url} width={16} height={16} />
          <AvatarFallback />
        </Avatar>
      }
    >
      {data?.username ?? formatAddress(reveal.address!)}
    </Badge>
  )
}

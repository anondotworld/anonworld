import { Post, Reveal } from '@anonworld/common'
import { formatAddress, timeAgo } from '../../../utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Text,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { PostEmbed } from './embeds'
import { Badge } from '../../badge'
import { useFarcasterIdentity } from '../../../hooks/use-farcaster-identity'
import { PostActions } from './actions'
import { PostCommunities } from './communities'
import { PostCredential } from './credential'
import { VaultBadge } from '../../vaults/badge'
import { ReplyButton } from '../actions/reply'
import { LikeButton } from '../actions/like'
import { Link, TextLink } from 'solito/link'
import { Reply } from '@tamagui/lucide-icons'

export function PostDisplay({ post, hoverable }: { post: Post; hoverable?: boolean }) {
  let text = post.text
  if (post.embeds) {
    for (const embed of post.embeds) {
      if (embed.url) {
        text = text.replace(embed.url, '')
      }
    }
  }

  const vaultId = post.credentials?.[0]?.vault_id

  return (
    <YStack
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bw="$0.5"
      p="$3"
      gap="$4"
      br="$4"
      $xs={{
        br: '$0',
        bw: '$0',
        btw: '$0.5',
      }}
      hoverStyle={hoverable ? { bg: '$color3' } : {}}
      cursor={hoverable ? 'pointer' : undefined}
      fs={1}
    >
      <YStack gap="$3">
        {post.parentText && (
          <XStack gap="$2" ai="center" pr="$8">
            <View>
              <Reply size={12} color="$color11" />
            </View>
            <Text fos="$1" fow="400" color="$color11" numberOfLines={1}>
              {`replying to ${post.parentText}`}
            </Text>
          </XStack>
        )}
        {post.credentials && post.credentials.length > 0 && (
          <XStack gap="$2" ai="center" onPress={(e) => e.preventDefault()}>
            {vaultId && (
              <Link href={`/profiles/${vaultId}`}>
                <VaultBadge vaultId={vaultId} />
              </Link>
            )}
            {post.credentials?.map((credential, index) => (
              <PostCredential key={index} credential={credential} />
            ))}
          </XStack>
        )}
        {(!post.credentials || post.credentials.length === 0) && (
          <XStack gap="$2" ai="center" onPress={(e) => e.preventDefault()}>
            <Avatar size="$1" circular>
              <Avatar.Image src={post.author.pfp_url} />
              <Avatar.Fallback />
            </Avatar>
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
          </XStack>
        )}
      </YStack>
      <Text lineHeight={22}>{text}</Text>
      {post.embeds?.map((embed, index) => (
        <PostEmbed key={index} embed={embed} />
      ))}
      <XStack jc="space-between" ai="flex-end">
        <XStack ai="center" gap="$2">
          <LikeButton post={post} />
          <ReplyButton post={post} showCount />
          {post.reveal?.phrase && <RevealBadge reveal={post.reveal} />}
        </XStack>
        <XStack ai="center" gap="$2">
          {post.relationships.length > 0 && (
            <View onPress={(e) => e.preventDefault()}>
              <PostCommunities post={post} />
            </View>
          )}
          <Badge>{timeAgo(post.timestamp)}</Badge>
        </XStack>
      </XStack>
      <View position="absolute" top="$2" right="$3" onPress={(e) => e.preventDefault()}>
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

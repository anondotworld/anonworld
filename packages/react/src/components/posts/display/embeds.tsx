import { Embed } from '@anonworld/sdk/types'
import { timeAgo } from '../../../utils'
import { Avatar, Image, Text, View, XStack, YStack } from '@anonworld/ui'
import { X } from '../../svg/x'
import { useTwitterPost } from '../../../hooks/use-twitter-post'

export function PostEmbed({ embed }: { embed: Embed }) {
  if (embed.cast) {
    const filteredEmbeds = embed.cast.embeds?.filter((e) => !e.cast)
    let text = embed.cast.text
    if (filteredEmbeds) {
      for (const embed of filteredEmbeds) {
        if (embed.url) {
          text = text.replace(embed.url, '')
        }
      }
    }

    return (
      <YStack theme="surface1" bc="$borderColor" bw="$0.5" br="$4" p="$3" gap="$2">
        <XStack ai="center" gap="$2">
          <Avatar size="$1" circular>
            <Avatar.Image src={embed.cast.author.pfp_url} />
            <Avatar.Fallback />
          </Avatar>
          <Text fos="$2" fow="500">
            {embed.cast.author.username}
          </Text>
          <Text fos="$2" fow="400" col="$color11">
            {timeAgo(embed.cast.timestamp)}
          </Text>
        </XStack>
        <Text lineHeight={22}>{text}</Text>
        {filteredEmbeds?.map((embed) => (
          <PostEmbed key={embed.url} embed={embed} />
        ))}
      </YStack>
    )
  }

  if (embed.metadata?.image) {
    return (
      <View ai="center">
        <Image
          src={embed.url}
          br="$4"
          width={embed.metadata.image.width_px}
          aspectRatio={embed.metadata.image.width_px / embed.metadata.image.height_px}
          maxWidth="100%"
        />
      </View>
    )
  }

  if (embed.url?.includes('x.com') || embed.url?.includes('twitter.com')) {
    const cleaned = embed.url.split('?')[0]
    const tweetId = cleaned.split('/').pop()
    const username = cleaned.split('/').slice(-3, -2).pop()
    if (tweetId && username) {
      return <TwitterEmbed tweetId={tweetId} username={username} />
    }
  }

  return (
    <Text
      col="$color11"
      onPress={() => window.open(embed.url, '_blank')}
      hoverStyle={{ textDecorationLine: 'underline' }}
    >
      {embed.url}
    </Text>
  )
}

function TwitterEmbed({ tweetId, username }: { tweetId: string; username: string }) {
  const { data } = useTwitterPost(`https://x.com/${username}/status/${tweetId}`)

  if (!data) return null

  return (
    <YStack theme="surface1" bc="$borderColor" bw="$0.5" br="$4" p="$3" gap="$2">
      <XStack ai="center" gap="$2">
        <X size={16} />
        <Text fos="$2" fow="500">
          {`@${data.author.screen_name}`}
        </Text>
        <Text fos="$2" fow="400" col="$color11">
          {timeAgo(data.created_at)}
        </Text>
      </XStack>
      <Text lineHeight={22} numberOfLines={10}>
        {data.text}
      </Text>
      {data.media?.photos?.map((photo) => (
        <Image
          key={photo.url}
          src={photo.url}
          f={1}
          aspectRatio={photo.width / photo.height}
          maxWidth={photo.width}
          maxHeight={photo.height}
          br="$4"
        />
      ))}
    </YStack>
  )
}

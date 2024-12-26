import { Link, Reply, X, Image as ImageIcon } from '@tamagui/lucide-icons'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Image,
  Input,
  Text,
  useDebounceValue,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { Content } from './context'
import { NamedExoticComponent, useEffect, useState } from 'react'
import { useFarcasterCast } from '../../../hooks/use-farcaster-cast'
import { useTwitterPost } from '../../../hooks/use-twitter-post'
import { X as XLogo } from '../../svg/x'
import { useNewPost } from './context'
import { useWebsiteMetadata } from '../../../hooks/use-website-metadata'

export function NewPostReply() {
  const { reply, setReply } = useNewPost()
  if (!reply) return null
  return (
    <NewPostContent
      content={reply}
      onChange={setReply}
      Icon={Reply}
      placeholder="Reply to Warpcast or X URL (optional)"
    />
  )
}

export function NewPostLink() {
  const { link, setLink } = useNewPost()
  if (!link) return null
  return (
    <NewPostContent
      content={link}
      onChange={setLink}
      Icon={Link}
      placeholder="Link to a website (optional)"
    />
  )
}

export function NewPostImage() {
  const { image, setImage } = useNewPost()
  if (!image) return null
  return (
    <NewPostContent
      content={image}
      onChange={setImage}
      Icon={ImageIcon}
      placeholder="Image"
      editable={false}
    />
  )
}

export function NewPostContent({
  content,
  onChange,
  Icon,
  placeholder,
  editable = true,
}: {
  content: Content | null
  onChange: (text: string | null) => void
  Icon: NamedExoticComponent<{ size: number; color: string }>
  placeholder: string
  editable?: boolean
}) {
  const [value, setValue] = useState(content?.url || '')
  const [error, setError] = useState<string | null>(null)

  const debouncedValue = useDebounceValue(value, 300)

  const handleRemove = () => {
    onChange(null)
    setValue('')
  }

  useEffect(() => {
    if (debouncedValue) {
      try {
        setError(null)
        onChange(debouncedValue)
        setValue(debouncedValue)
      } catch (e) {
        setError((e as Error).message)
      }
    } else {
      setError(null)
      onChange('')
      setValue('')
    }
  }, [debouncedValue])

  return (
    <View>
      <YStack
        theme="surface2"
        bg="$background"
        p="$2"
        bc="$borderColor"
        bw="$0.25"
        br="$4"
        group
        gap="$2"
      >
        <XStack ai="center">
          <Icon color={error || content || value ? '$color12' : '$color11'} size={16} />
          {editable ? (
            <Input
              color={error ? '$red11' : content || value ? '$color12' : '$color11'}
              placeholder={placeholder}
              placeholderTextColor="$color11"
              value={value}
              onChangeText={setValue}
              f={1}
              p="$0"
              bw="$0"
              h="auto"
              focusVisibleStyle={{
                outlineWidth: 0,
              }}
              fontSize="$1"
              px="$2"
            />
          ) : (
            <View f={1} />
          )}
          {content ? (
            <View
              p="$1.5"
              br="$12"
              bg="$color9"
              hoverStyle={{ bg: '$color7' }}
              cursor="pointer"
              onPress={handleRemove}
            >
              <X size={12} strokeWidth={3} />
            </View>
          ) : null}
        </XStack>
        {content?.type === 'farcaster' && <FarcasterEmbed identifier={content.url} />}
        {content?.type === 'twitter' && <TwitterEmbed identifier={content.url} />}
        {content?.type === 'link' && <LinkEmbed url={content.url} />}
        {content?.type === 'image' && <ImageEmbed url={content.url} />}
      </YStack>
    </View>
  )
}

function FarcasterEmbed({ identifier }: { identifier: string }) {
  const { data } = useFarcasterCast(identifier)
  if (!data) return null
  return (
    <YStack p="$2" gap="$2" theme="surface3" bg="$background" br="$2">
      <XStack gap="$2" ai="center">
        <Avatar circular size={16}>
          <AvatarImage src={data.author.pfp_url} w={16} h={16} />
          <AvatarFallback />
        </Avatar>
        <Text fos="$2" fow="600">
          {data.author.username}
        </Text>
      </XStack>
      <Text fos="$2" fow="400" numberOfLines={3}>
        {data.text}
      </Text>
      {data.embeds.length > 0 && (
        <Text fos="$2" fow="400">
          {`+ ${data.embeds.length} embeds`}
        </Text>
      )}
    </YStack>
  )
}

function TwitterEmbed({ identifier }: { identifier: string }) {
  const { data } = useTwitterPost(identifier)
  if (!data) return null
  return (
    <YStack p="$2" gap="$2" theme="surface3" bg="$background" br="$2">
      <XStack gap="$2" ai="center">
        <XLogo size={12} />
        <Text fos="$2" fow="600">
          {data.author.screen_name}
        </Text>
      </XStack>
      <Text fos="$2" fow="400" numberOfLines={3}>
        {data.text}
      </Text>
      {data.media?.photos && data.media.photos.length > 0 && (
        <Text fos="$2" fow="400">
          {`+ ${data.media.photos.length} embeds`}
        </Text>
      )}
    </YStack>
  )
}

function LinkEmbed({ url }: { url: string }) {
  const { data } = useWebsiteMetadata(url)
  if (!data) return null
  return (
    <XStack p="$2" gap="$2" theme="surface3" bg="$background" br="$2">
      <Image src={data.image} aspectRatio={16 / 9} w="$8" br="$2" />
      <YStack gap="$2" f={1}>
        <Text fos="$2" fow="600">
          {data.title}
        </Text>
        <Text fos="$2" fow="400" numberOfLines={2}>
          {data.description}
        </Text>
      </YStack>
    </XStack>
  )
}

function ImageEmbed({ url }: { url: string }) {
  return (
    <Image
      src={url}
      aspectRatio={16 / 9}
      f={1}
      maxHeight={200}
      resizeMode="contain"
      br="$2"
    />
  )
}

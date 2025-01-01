import { Button, Circle, Spinner, Text, View, XStack } from '@anonworld/ui'
import { useNewPost } from './context'
import { Eye, Image, Link, Reply } from '@tamagui/lucide-icons'
import { useEffect, useRef, useState } from 'react'
import { useUploadImage } from '../../../hooks/use-upload-image'

export function NewPostFooter() {
  const { text } = useNewPost()
  const textLength = new Blob([text ?? '']).size
  return (
    <XStack ai="center" jc="space-between">
      <XStack gap="$3" $xs={{ gap: '$2' }}>
        <EmbedImage />
        <EmbedLink />
        <EmbedReply />
        <RevealPhrase />
      </XStack>
      <XStack gap="$3" $xs={{ gap: '$2' }}>
        <CircularProgress length={textLength} max={320} />
        <NewPostSubmit disabled={textLength > 320} />
      </XStack>
    </XStack>
  )
}

function EmbedImage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { data, isLoading } = useUploadImage(selectedFile)
  const { image, setImage } = useNewPost()

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      return
    }

    setSelectedFile(file)
  }

  useEffect(() => {
    if (data) {
      setImage(data)
    }
  }, [data])

  return (
    <View position="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />
      <Button
        size="$3"
        theme="surface1"
        bg={image ? '$color12' : '$background'}
        bw="$0.5"
        bc="$borderColor"
        w="$3"
        h="$3"
        p="$0"
        hoverStyle={{ bg: image ? '$color12' : '$background', opacity: 0.75 }}
        onPress={(e) => {
          if (isLoading) return
          if (image) {
            setImage(null)
            return
          }
          e.stopPropagation()
          e.preventDefault()
          fileInputRef.current?.click()
        }}
      >
        {isLoading ? (
          <Spinner color="$color12" />
        ) : (
          <Image size={16} color={image ? '$color1' : '$color12'} />
        )}
      </Button>
    </View>
  )
}

function EmbedLink() {
  const { link, setLink } = useNewPost()
  return (
    <Button
      size="$3"
      theme="surface1"
      bg={link ? '$color12' : '$background'}
      bw="$0.5"
      bc="$borderColor"
      w="$3"
      h="$3"
      p="$0"
      hoverStyle={{ bg: link ? '$color12' : '$background', opacity: 0.75 }}
      onPress={() => setLink(link ? null : '')}
    >
      <Link size={16} color={link ? '$color1' : '$color12'} />
    </Button>
  )
}

function EmbedReply() {
  const { reply, setReply } = useNewPost()
  return (
    <Button
      size="$3"
      theme="surface1"
      bg={reply ? '$color12' : '$background'}
      bw="$0.5"
      bc="$borderColor"
      w="$3"
      h="$3"
      p="$0"
      hoverStyle={{ bg: reply ? '$color12' : '$background', opacity: 0.75 }}
      onPress={() => setReply(reply ? null : '')}
    >
      <Reply size={16} color={reply ? '$color1' : '$color12'} />
    </Button>
  )
}

function RevealPhrase() {
  const { revealPhrase, setRevealPhrase } = useNewPost()
  return (
    <Button
      size="$3"
      theme="surface1"
      bg={revealPhrase !== null ? '$color12' : '$background'}
      bw="$0.5"
      bc="$borderColor"
      w="$3"
      h="$3"
      p="$0"
      hoverStyle={{
        bg: revealPhrase !== null ? '$color12' : '$background',
        opacity: 0.75,
      }}
      onPress={() => setRevealPhrase(revealPhrase !== null ? null : '')}
    >
      <Eye size={16} color={revealPhrase !== null ? '$color1' : '$color12'} />
    </Button>
  )
}

function CircularProgress({ length, max }: { length: number; max: number }) {
  const progress = Math.min((length / max) * 100, 100)
  const angle = Math.min((progress * 360) / 100, 359.9)
  const isOverLimit = length > max

  if (isOverLimit) {
    return (
      <Text fos="$2" fow="500" color="$red10">
        {`-${length - max}`}
      </Text>
    )
  }

  return (
    <View jc="center" ai="center" w={24}>
      <Circle size={24} bg="$color10" position="absolute" />
      <Circle
        size={24}
        bg={isOverLimit ? '$red10' : '$color12'}
        position="absolute"
        o={0.9}
        style={{
          clipPath: `path('M 14,14 L 14,0 A 14,14 0 ${angle <= 180 ? 0 : 1} 1 ${
            14 + Math.sin((angle * Math.PI) / 180) * 14
          },${14 - Math.cos((angle * Math.PI) / 180) * 14} Z')`,
        }}
      />
      <Circle size={18} bg="$color1" position="absolute" $xs={{ bg: '$color2' }} />
    </View>
  )
}

function NewPostSubmit({ disabled }: { disabled: boolean }) {
  const { post, status, credentials } = useNewPost()
  return (
    <Button
      size="$3"
      bg="$color12"
      br="$12"
      px="$4"
      bw="$0"
      disabledStyle={{ opacity: 0.5, bg: '$color12' }}
      hoverStyle={{ opacity: 0.9, bg: '$color12' }}
      pressStyle={{ opacity: 0.9, bg: '$color12' }}
      disabled={disabled || credentials.length === 0 || status === 'pending'}
      onPress={post}
    >
      {status === 'pending' ? (
        <Spinner color="$color1" />
      ) : (
        <Text fos="$2" fow="600" color="$color1">
          Post
        </Text>
      )}
    </Button>
  )
}

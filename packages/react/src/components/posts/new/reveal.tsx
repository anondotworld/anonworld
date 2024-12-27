import { useNewPost } from './context'

import { Eye, X } from '@tamagui/lucide-icons'
import { Input, View, XStack, YStack } from '@anonworld/ui'

export function NewPostRevealPhrase() {
  const { revealPhrase, setRevealPhrase } = useNewPost()
  if (revealPhrase === null) return null

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
          <Eye color={revealPhrase ? '$color12' : '$color11'} size={16} />
          <Input
            color={revealPhrase ? '$color12' : '$color11'}
            placeholder="Enter a complex secret phrase to reveal this post later"
            placeholderTextColor="$color11"
            value={revealPhrase || ''}
            onChangeText={setRevealPhrase}
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
          <View
            p="$1.5"
            br="$12"
            bg="$color9"
            hoverStyle={{ bg: '$color7' }}
            cursor="pointer"
            onPress={() => setRevealPhrase(null)}
          >
            <X size={12} strokeWidth={3} />
          </View>
        </XStack>
      </YStack>
    </View>
  )
}

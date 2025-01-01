import { CircleCheck } from '@tamagui/lucide-icons'
import { X } from '@tamagui/lucide-icons'
import {
  Adapt,
  Button,
  Dialog,
  Sheet,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { useAuth } from '../../providers'
import { ReactNode, useState } from 'react'

export function AuthLogin({ children }: { children: ReactNode }) {
  const { authenticate, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <Adapt when="sm">
        <Sheet
          animation="quicker"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          <Sheet.Frame padding="$4" pb="$5" gap="$3" bg="$color2">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="quicker"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quicker"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          w={600}
          gap="$4"
        >
          <Dialog.Title fos="$5">Login</Dialog.Title>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              Why login?
            </Text>
            <XStack gap="$2">
              <CircleCheck size={16} color="$green11" />
              <Text>Create a public, anonymous profile to link together your posts</Text>
            </XStack>
            <XStack gap="$2">
              <CircleCheck size={16} color="$green11" />
              <Text>Backup your credentials to share between devices</Text>
            </XStack>
            <XStack gap="$2">
              <CircleCheck size={16} color="$green11" />
              <Text>Like posts and more coming soon</Text>
            </XStack>
          </YStack>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              Is it anonymous?
            </Text>
            <Text>
              Passkeys are used to anonymously authenticate you. There is no personal
              information stored that can be used to identify you.
            </Text>
          </YStack>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              Do I have to login?
            </Text>
            <Text>
              Logging in is completely optional. You can always use the app without
              logging in.
            </Text>
          </YStack>
          <Button
            bg="$color12"
            br="$4"
            disabledStyle={{ opacity: 0.5, bg: '$color12' }}
            hoverStyle={{ opacity: 0.9, bg: '$color12' }}
            pressStyle={{ opacity: 0.9, bg: '$color12' }}
            onPress={async () => {
              await authenticate()
              setIsOpen(false)
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner color="$color1" />
            ) : (
              <Text fos="$3" fow="600" color="$color1">
                Login
              </Text>
            )}
          </Button>
          <Dialog.Close asChild>
            <View
              bg="$background"
              p="$2"
              br="$12"
              hoverStyle={{ bg: '$color5' }}
              cursor="pointer"
              position="absolute"
              top="$2"
              right="$2"
            >
              <X size={20} />
            </View>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

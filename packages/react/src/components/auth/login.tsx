import { CircleCheck, UserCircle } from '@tamagui/lucide-icons'
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
import { useSDK } from '../../providers'
import { useState } from 'react'
export function AuthLogin() {
  const { auth } = useSDK()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <View
          bg="$background"
          br="$12"
          hoverStyle={{ bg: '$color5' }}
          cursor="pointer"
          w={32}
          h={32}
          jc="center"
          ai="center"
        >
          <UserCircle size={20} strokeWidth={2.5} />
        </View>
      </Dialog.Trigger>
      <Adapt when="sm">
        <Sheet animation="quicker" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$2">
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
              information stored that can be used to identify you. This is completely
              optional, you can always post without logging in.
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
            themeInverse
            bg="$background"
            br="$4"
            disabledStyle={{ opacity: 0.5 }}
            hoverStyle={{ opacity: 0.9 }}
            onPress={async () => {
              await auth.authenticate()
              setIsOpen(false)
            }}
            disabled={auth.isLoading}
          >
            {auth.isLoading ? (
              <Spinner color="$color12" />
            ) : (
              <Text fos="$3" fow="600">
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

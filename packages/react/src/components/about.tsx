import { HelpCircle } from '@tamagui/lucide-icons'

import { X } from '@tamagui/lucide-icons'
import { Adapt, Dialog, Sheet, Text, View, XStack, YStack } from '@anonworld/ui'
import { AnonWorld } from './svg/anonworld'

export function About() {
  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <View
          bg="$background"
          p="$2"
          br="$12"
          hoverStyle={{ bg: '$color5' }}
          cursor="pointer"
        >
          <HelpCircle size={20} strokeWidth={2.5} />
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
          <XStack gap="$2" ai="center">
            <AnonWorld size={44} />
            <YStack>
              <Dialog.Title fow="600" fos="$4">
                ANON.WORLD
              </Dialog.Title>
              <Dialog.Description color="$color11" fos="$1">
                An anonymous social network.
              </Dialog.Description>
            </YStack>
          </XStack>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              What is anon.world?
            </Text>
            <Text>
              An anonymous social network for browsing and creating anonymous posts with
              verified credentials.
            </Text>
          </YStack>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              How does it work?
            </Text>
            <Text>
              We use zero-knowledge (zk) proofs to generate anonymous credentials. These
              credentials are stored locally in your browser. When you create a post, you
              can attach as many credentials as you'd like to your post.
            </Text>
          </YStack>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              What is a community?
            </Text>
            <Text>
              A community is a group of users with shared credentials. Communities can
              anonymously post to a shared social media account (currently Farcaster or
              X). Anyone can create a community with any token requirements.
            </Text>
          </YStack>
          <YStack gap="$2">
            <Text fos="$2" fow="400" col="$color11">
              Support
            </Text>
            <Text>
              If you run into any issues or have questions, DM @slokh on{' '}
              <a href="https://warpcast.com/slokh" target="_blank" rel="noreferrer">
                Farcaster
              </a>{' '}
              or{' '}
              <a href="https://twitter.com/slokh" target="_blank" rel="noreferrer">
                Twitter
              </a>
              .
            </Text>
          </YStack>
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

import { X } from '@tamagui/lucide-icons'
import {
  YStack,
  Adapt,
  Button,
  Dialog,
  Input,
  Sheet,
  Text,
  useToastController,
  View,
  Spinner,
  XStack,
  Label,
  Circle,
} from '@anonworld/ui'
import { Cast } from '../../../types'
import { useState } from 'react'
import { usePostReveal } from '../../../hooks/use-post-reveal'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { hashMessage } from 'viem'
import { useSDK } from '../../../providers'
import { formatAddress } from '../../../utils'

export function PostReveal({
  post,
  children,
  open,
  onOpenChange,
}: {
  post: Cast
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutateAsync } = usePostReveal()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const toast = useToastController()

  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const handleReveal = async () => {
    if (!post.reveal || !address) return

    setIsRevealing(true)

    const inputHash = hashMessage(post.reveal.input + value)
    if (inputHash !== post.reveal.revealHash) {
      setError('Incorrect phrase')
      setIsRevealing(false)
      return
    }

    try {
      const message = JSON.stringify({
        revealHash: post.reveal.revealHash,
        revealPhrase: value,
      })
      const signature = await signMessageAsync({
        message,
      })

      await mutateAsync({
        hash: post.hash,
        message,
        phrase: value,
        signature,
        address,
      })
      onOpenChange(false)
      toast.show('Revealed post')
    } catch (e) {
      setError((e as Error).message)
    }
    setIsRevealing(false)
  }

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      {children}
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
          gap="$2"
          w={600}
        >
          <Dialog.Title fos="$5">Reveal Post</Dialog.Title>
          <WalletField />
          <YStack>
            <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
              Reveal Phrase
            </Label>
            <Input
              value={value}
              onChangeText={setValue}
              placeholder="Enter your reveal phrase..."
              placeholderTextColor="$color11"
            />
          </YStack>
          <YStack mt="$4" gap="$2">
            {error && (
              <Text color="$red11" textAlign="center" mt="$-2">
                {error}
              </Text>
            )}
            <Button
              themeInverse
              bg="$background"
              br="$4"
              disabled={isRevealing || !value}
              disabledStyle={{ opacity: 0.5 }}
              hoverStyle={{ opacity: 0.9 }}
              onPress={handleReveal}
            >
              {!isRevealing ? (
                <Text fos="$3" fow="600">
                  Reveal Post
                </Text>
              ) : (
                <Spinner color="$color12" />
              )}
            </Button>
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

function WalletField() {
  const { address } = useAccount()
  const { connectWallet } = useSDK()
  const { disconnect } = useDisconnect()

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Wallet
      </Label>
      <XStack
        ai="center"
        jc="space-between"
        bc="$borderColor"
        bw="$0.5"
        br="$4"
        py="$2.5"
        px="$3"
        theme="surface1"
        bg="$background"
      >
        <XStack gap="$2.5" ai="center" mx="$2">
          <Circle size={8} bg={address ? '$green11' : '$red11'} />
          <Text fos="$2" fow="400" color={address ? '$color12' : '$color11'}>
            {address ? formatAddress(address) : 'No wallet connected.'}
          </Text>
        </XStack>
        <Button
          size="$2.5"
          themeInverse
          bg="$background"
          br="$4"
          bw="$0"
          hoverStyle={{ opacity: 0.9 }}
          onPress={() => {
            if (address) {
              disconnect()
            } else {
              connectWallet?.()
            }
          }}
        >
          <Text fos="$2" fow="600">
            {address ? 'Disconnect' : 'Connect'}
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}

import { Button, Dialog, Text, View } from '@anonworld/ui'
import { Circle, XStack } from '@anonworld/ui'
import { Label } from '@anonworld/ui'
import { YStack } from '@anonworld/ui'
import { isMobile } from '@anonworld/common'
import { QRCode, useProfile, useSignIn, useSignInMessage } from '@farcaster/auth-kit'
import { useEffect, useState } from 'react'
import { X } from '@tamagui/lucide-icons'

export type FarcasterAuth = {
  profile: {
    fid?: number
    pfpUrl?: string
    username?: string
    displayName?: string
    bio?: string
    custody?: `0x${string}`
    verifications?: string[]
  }
  message: string
  signature: string
}

export function SiwfField({
  farcasterAuth,
  onConnect,
  onDisconnect,
}: {
  farcasterAuth: FarcasterAuth | undefined
  onConnect: (account: FarcasterAuth) => void
  onDisconnect: () => void
}) {
  const [url, setUrl] = useState<string | undefined>(undefined)

  return (
    <>
      <YStack>
        <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Account
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
          <SiwfUser farcasterAuth={farcasterAuth} />
          <SiwfButton
            setUrl={setUrl}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            isConnected={!!farcasterAuth}
          />
        </XStack>
      </YStack>
      <SiwfDialog url={url} setUrl={setUrl} />
    </>
  )
}

function SiwfUser({ farcasterAuth }: { farcasterAuth: FarcasterAuth | undefined }) {
  return (
    <XStack gap="$2.5" ai="center" mx="$2">
      <Circle size={8} bg={farcasterAuth ? '$green11' : '$red11'} />
      <Text fos="$2" fow="400" color={farcasterAuth ? '$color12' : '$color11'}>
        {farcasterAuth ? farcasterAuth.profile.username : 'No account connected.'}
      </Text>
    </XStack>
  )
}

function SiwfButton({
  setUrl,
  onConnect,
  onDisconnect,
  isConnected,
}: {
  setUrl: (url: string | undefined) => void
  onConnect: (account: FarcasterAuth) => void
  onDisconnect: () => void
  isConnected: boolean
}) {
  const { signOut, channelToken, url, connect, isError, reconnect, signIn } = useSignIn(
    {}
  )
  const { message, signature } = useSignInMessage()
  const { isAuthenticated, profile } = useProfile()

  useEffect(() => {
    if (isAuthenticated && message && signature) {
      onConnect({ profile, message, signature })
      setUrl(undefined)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!channelToken) {
      connect()
    }
  }, [channelToken])

  const handlePress = () => {
    if (isError) {
      reconnect()
    }

    if (isConnected) {
      if (isAuthenticated) {
        signOut()
      }
      onDisconnect()
      return
    }

    setUrl(url)
    signIn()
    if (url && isMobile()) {
      window.open(url, '_blank')
    }
  }

  return (
    <Button
      size="$2.5"
      bg="$color12"
      br="$4"
      bw="$0"
      disabledStyle={{ opacity: 0.5, bg: '$color12' }}
      hoverStyle={{ opacity: 0.9, bg: '$color12' }}
      pressStyle={{ opacity: 0.9, bg: '$color12' }}
      onPress={handlePress}
    >
      <Text fos="$2" fow="600" color="$color1">
        {isConnected ? 'Disconnect' : 'Connect'}
      </Text>
    </Button>
  )
}

function SiwfDialog({
  url,
  setUrl,
}: {
  url: string | undefined
  setUrl: (url: string | undefined) => void
}) {
  return (
    <Dialog modal open={!!url} onOpenChange={() => setUrl(undefined)}>
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
          w={500}
        >
          <Dialog.Title fos="$5">Connect Farcaster</Dialog.Title>
          <Dialog.Description fos="$2" color="$color11">
            Scan the QR code on your phone to connect through Warpcast.
          </Dialog.Description>
          {url && (
            <View
              bg="white"
              ai="center"
              alignSelf="center"
              my="$4"
              brw="$1.5"
              btw="$1.5"
              blw="$1.5"
              bc="white"
            >
              <QRCode uri={url} />
            </View>
          )}
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

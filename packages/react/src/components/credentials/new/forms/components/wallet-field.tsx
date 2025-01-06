import { Button, Text } from '@anonworld/ui'
import { Circle, XStack } from '@anonworld/ui'
import { Label } from '@anonworld/ui'
import { YStack } from '@anonworld/ui'
import { useAccount, useDisconnect } from 'wagmi'
import { formatAddress } from '@anonworld/common'

export function WalletField({ connectWallet }: { connectWallet: () => void }) {
  const { address } = useAccount()
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
          bg="$color12"
          br="$4"
          bw="$0"
          disabledStyle={{ opacity: 0.5, bg: '$color12' }}
          hoverStyle={{ opacity: 0.9, bg: '$color12' }}
          pressStyle={{ opacity: 0.9, bg: '$color12' }}
          onPress={() => {
            if (address) {
              disconnect()
            } else {
              connectWallet?.()
            }
          }}
        >
          <Text fos="$2" fow="600" color="$color1">
            {address ? 'Disconnect' : 'Connect'}
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}

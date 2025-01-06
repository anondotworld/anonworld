import { NewCredentialDialog } from './dialog'
import { Button, Text, XStack } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { AuthKitProvider } from '@farcaster/auth-kit'
import { Plus } from '@tamagui/lucide-icons'

export function NewCredential({
  initialTokenId,
  initialBalance,
}: {
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
}) {
  return (
    <AuthKitProvider
      config={{
        rpcUrl: 'https://mainnet.optimism.io',
        domain: 'localhost:3000',
        siweUri: 'http://localhost:3000',
        relay: 'https://relay.farcaster.xyz',
      }}
    >
      <NewCredentialDialog
        initialTokenId={initialTokenId}
        initialBalance={initialBalance}
      >
        <Dialog.Trigger asChild>
          <Button
            size="$3"
            bg="$color12"
            br="$12"
            bw="$0"
            disabledStyle={{ opacity: 0.5, bg: '$color12' }}
            hoverStyle={{ opacity: 0.9, bg: '$color12' }}
            pressStyle={{ opacity: 0.9, bg: '$color12' }}
          >
            <XStack ai="center" gap="$2">
              <Plus size={16} strokeWidth={2.5} color="$color1" />
              <Text fos="$2" fow="600" color="$color1">
                Add Credential
              </Text>
            </XStack>
          </Button>
        </Dialog.Trigger>
      </NewCredentialDialog>
    </AuthKitProvider>
  )
}

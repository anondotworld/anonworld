import { NewCredentialProvider } from './context'
import { NewCredentialDialog } from './dialog'
import { Button, Text, XStack } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { Plus } from '@tamagui/lucide-icons'

export function NewCredential({
  initialTokenId,
  initialBalance,
}: {
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
}) {
  return (
    <NewCredentialProvider
      initialTokenId={initialTokenId}
      initialBalance={initialBalance}
    >
      <NewCredentialDialog>
        <Dialog.Trigger asChild>
          <Button
            size="$3"
            themeInverse
            bg="$background"
            br="$12"
            bw="$0"
            hoverStyle={{ opacity: 0.9 }}
          >
            <XStack ai="center" gap="$2">
              <Plus size={16} strokeWidth={2.5} />
              <Text fos="$2" fow="600">
                Add Credential
              </Text>
            </XStack>
          </Button>
        </Dialog.Trigger>
      </NewCredentialDialog>
    </NewCredentialProvider>
  )
}

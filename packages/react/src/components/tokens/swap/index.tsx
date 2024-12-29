import { Text, XStack, Button, Dialog } from '@anonworld/ui'
import { SwapTokensProvider } from './context'
import { SwapTokensDialog } from './dialog'
import { ArrowLeftRight } from '@tamagui/lucide-icons'

export function SwapTokens({
  initialBuyToken,
  initialSellToken,
}: {
  initialBuyToken?: { chainId: number; address: string }
  initialSellToken?: { chainId: number; address: string }
}) {
  return (
    <SwapTokensProvider
      initialBuyToken={initialBuyToken}
      initialSellToken={initialSellToken}
    >
      <SwapTokensDialog>
        <Dialog.Trigger asChild>
          <Button
            size="$2"
            px="$3"
            bg="$background"
            bc="$borderColor"
            bw="$0.25"
            br="$12"
            hoverStyle={{ opacity: 0.9 }}
          >
            <XStack ai="center" gap="$1">
              <ArrowLeftRight size={12} />
              <Text fos="$1">Swap</Text>
            </XStack>
          </Button>
        </Dialog.Trigger>
      </SwapTokensDialog>
    </SwapTokensProvider>
  )
}

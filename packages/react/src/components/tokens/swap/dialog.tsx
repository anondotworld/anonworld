import { X } from '@tamagui/lucide-icons'
import { Adapt, Dialog, Sheet, View } from '@anonworld/ui'
import { useSwapTokens } from './context'
import { SwapForm } from './form'

export function SwapTokensDialog({ children }: { children?: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSwapTokens()
  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
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

        {isOpen && (
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
            gap="$3"
          >
            <Dialog.Title>Swap</Dialog.Title>
            <SwapForm />
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
        )}
      </Dialog.Portal>
    </Dialog>
  )
}

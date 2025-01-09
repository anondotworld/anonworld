import { X } from '@tamagui/lucide-icons'
import { Adapt, Dialog, Sheet, View, Unspaced } from '@anonworld/ui'
import { useNewCommunity } from './context'
import { NewCommunityForm } from './form'

export function NewCommunityDialog({ children }: { children?: React.ReactNode }) {
  const { isOpen, setIsOpen } = useNewCommunity()

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
          {isOpen && (
            <Sheet.Frame padding="$3" pb="$5" gap="$3" bg="$color2">
              <Adapt.Contents />
            </Sheet.Frame>
          )}
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
          <Dialog.Title fos="$5">New Community</Dialog.Title>
          <NewCommunityForm />
          <Unspaced>
            <Dialog.Close asChild>
              <View
                bg="$background"
                p="$2"
                br="$12"
                hoverStyle={{ bg: '$color5' }}
                cursor="pointer"
                pos="absolute"
                top="$3"
                right="$3"
              >
                <X size={20} />
              </View>
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

import { X } from '@tamagui/lucide-icons'
import { Adapt, Dialog, Sheet, Text, View } from '@anonworld/ui'
import { useNewPost } from './context'
import { NewPostCredentials } from './credentials'
import { NewPostImage, NewPostLink, NewPostReply } from './content'
import { NewPostText } from './text'
import { NewPostFooter } from './footer'
import { NewPostRevealPhrase } from './reveal'

export function NewPostDialog({ children }: { children?: React.ReactNode }) {
  const { isOpen, setIsOpen } = useNewPost()
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
          <Dialog.Title display="none">Create Post</Dialog.Title>
          <NewPostCredentials />
          <NewPostReply />
          <NewPostText />
          <NewPostLink />
          <NewPostImage />
          <NewPostRevealPhrase />
          <NewPostFooter />
          <NewPostError />
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

function NewPostError() {
  const { error } = useNewPost()
  if (!error) return null
  return (
    <View theme="red" bg="$background" p="$3" br="$4" bc="$borderColor" bw="$0.5">
      <Text fos="$2" fow="600" color="$red11">
        {`Error: ${error.message}`}
      </Text>
    </View>
  )
}

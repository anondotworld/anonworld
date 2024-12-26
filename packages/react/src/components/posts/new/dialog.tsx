import { Plus, X } from '@tamagui/lucide-icons'
import { Adapt, Button, Dialog, Sheet, Text, View, XStack } from '@anonworld/ui'
import { useNewPost } from './context'
import { NewPostCredentials } from './credentials'
import { NewPostImage, NewPostLink, NewPostReply } from './content'
import { NewPostText } from './text'
import { NewPostFooter } from './footer'

export function NewPostDialog() {
  const { isOpen, setIsOpen } = useNewPost()
  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
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
              Create Post
            </Text>
          </XStack>
        </Button>
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
          gap="$3"
        >
          <Dialog.Title display="none">Create Post</Dialog.Title>
          <NewPostCredentials />
          <NewPostReply />
          <NewPostText />
          <NewPostLink />
          <NewPostImage />
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

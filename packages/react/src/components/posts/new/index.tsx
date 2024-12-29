import { Button, Text, XStack } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { NewPostProvider } from './context'
import { NewPostDialog } from './dialog'
import { Plus } from '@tamagui/lucide-icons'

export function NewPostButton() {
  return (
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
  )
}

export function NewPost({ onSuccess }: { onSuccess: (hash: string) => void }) {
  return (
    <NewPostProvider onSuccess={onSuccess}>
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

import { Button, Text, XStack } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { NewCommunityProvider } from './context'
import { NewCommunityDialog } from './dialog'
import { Plus } from '@tamagui/lucide-icons'

export function NewCommunity() {
  return (
    <NewCommunityProvider>
      <NewCommunityDialog>
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
                New Community
              </Text>
            </XStack>
          </Button>
        </Dialog.Trigger>
      </NewCommunityDialog>
    </NewCommunityProvider>
  )
}

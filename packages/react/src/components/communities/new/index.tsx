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
                New Community
              </Text>
            </XStack>
          </Button>
        </Dialog.Trigger>
      </NewCommunityDialog>
    </NewCommunityProvider>
  )
}

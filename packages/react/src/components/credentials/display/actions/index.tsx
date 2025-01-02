import { MoreHorizontal } from '@tamagui/lucide-icons'
import { Popover, View } from '@anonworld/ui'
import { useState } from 'react'
import { CredentialWithId } from '@anonworld/common'
import { CredentialActionsContent } from './content'

export function CredentialActions({ credential }: { credential: CredentialWithId }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        onPress={(e) => {
          e.stopPropagation()
        }}
      >
        <View p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
          <MoreHorizontal size={20} />
        </View>
      </Popover.Trigger>
      <Popover.Content
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          '100ms',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
        cursor="pointer"
        bordered
        overflow="hidden"
      >
        {isOpen && <CredentialActionsContent credential={credential} />}
      </Popover.Content>
    </Popover>
  )
}

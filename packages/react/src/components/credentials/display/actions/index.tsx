import { MoreHorizontal } from '@tamagui/lucide-icons'
import { Popover, View } from '@anonworld/ui'
import { useState } from 'react'
import { Credential } from '../../../..'
import { CredentialProof } from '../proof'
import { CredentialActionsContent } from './content'

export function CredentialActions({ credential }: { credential: Credential }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewProof, setViewProof] = useState(false)

  return (
    <>
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
          {isOpen && (
            <CredentialActionsContent
              credential={credential}
              onViewProof={setViewProof}
            />
          )}
        </Popover.Content>
      </Popover>
      <CredentialProof
        open={viewProof}
        onOpenChange={setViewProof}
        credential={credential}
      />
    </>
  )
}

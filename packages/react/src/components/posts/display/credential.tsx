import { Popover, XStack } from '@anonworld/ui'
import { Credential } from '../../../types'
import { CredentialBadge } from '../../credentials/badge'
import { useState } from 'react'
import { CredentialAvatar } from '../../credentials/display/id'
import { timeAgo } from '../../../utils'
import { Badge } from '../../badge'

export function PostCredential({ credential }: { credential: Credential }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <CredentialBadge credential={credential} />
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
        cursor="pointer"
        bordered
        overflow="hidden"
        ai="flex-start"
        p="$2"
      >
        {isOpen && (
          <XStack ai="center" gap="$2">
            <CredentialAvatar id={credential.displayId} size="$1" />
            <Badge>ERC20 Balance</Badge>
            <Badge>{`Verified ${timeAgo(credential.verified_at)}`}</Badge>
          </XStack>
        )}
      </Popover.Content>
    </Popover>
  )
}

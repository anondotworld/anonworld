import { Popover, XStack } from '@anonworld/ui'
import { Credential, getCredential } from '@anonworld/common'
import { useState } from 'react'
import { timeAgo } from '../../../utils'
import { Badge } from '../../badge'
import { CredentialTypeBadge } from '../../credentials/types'

export function PostCredential({ credential }: { credential: Credential }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <CredentialTypeBadge credential={credential} />
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
            <Badge>{getCredential(credential.type)?.name}</Badge>
            <Badge>{`Verified ${timeAgo(credential.verified_at.toString())}`}</Badge>
          </XStack>
        )}
      </Popover.Content>
    </Popover>
  )
}

import { Text, XStack, YStack } from '@anonworld/ui'
import { Badge } from '../../badge'
import { MessageSquare } from '@tamagui/lucide-icons'
import { formatAmount, formatHexId } from '../../../utils'
import { timeAgo } from '../../../utils'
import { Vault } from '../../../types'
import { CredentialBadge } from '../../credentials'
import { VaultAvatar } from '../avatar'

export function VaultDisplay({ vault }: { vault: Vault }) {
  const id = formatHexId(vault.id)
  return (
    <YStack
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      p="$4"
      gap="$4"
      br="$4"
      bw="$0.5"
      f={1}
    >
      <XStack ai="center" gap="$4">
        <VaultAvatar id={id} size="$6" />
        <YStack gap="$2" f={1}>
          <Text fos="$4" fow="600">
            {id}
          </Text>
          <XStack gap="$2">
            <Badge>{timeAgo(vault.created_at)}</Badge>
            <Badge icon={<MessageSquare size={12} />}>{formatAmount(vault.posts)}</Badge>
            {vault.credentials.map((credential) => (
              <CredentialBadge key={credential.id} credential={credential} />
            ))}
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  )
}

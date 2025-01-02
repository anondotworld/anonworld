import { ScrollView, Text, XStack, YStack } from '@anonworld/ui'
import { Badge } from '../../badge'
import { MessageCircle } from '@tamagui/lucide-icons'
import { formatAmount, formatHexId } from '../../../utils'
import { timeAgo } from '../../../utils'
import { Vault } from '@anonworld/common'
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
      bw="$0.5"
      p="$3"
      gap="$4"
      br="$4"
      $xs={{
        br: '$0',
        bw: '$0',
        btw: '$0.5',
        bbw: '$0.5',
        px: '$2',
        py: '$3',
      }}
      f={1}
    >
      <XStack ai="center" gap="$4">
        <VaultAvatar id={id} size="$6" />
        <YStack gap="$2" f={1}>
          <Text fos="$4" fow="600">
            {id}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              <Badge>{timeAgo(vault.created_at)}</Badge>
              <Badge icon={<MessageCircle size={12} />}>
                {formatAmount(vault.posts)}
              </Badge>
              {vault.credentials.map((credential) => (
                <CredentialBadge key={credential.id} credential={credential} />
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      </XStack>
    </YStack>
  )
}

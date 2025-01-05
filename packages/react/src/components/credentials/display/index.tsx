import { CredentialWithId, getCredential } from '@anonworld/common'
import { View, XStack, YStack } from '@anonworld/ui'
import { CREDENTIAL_EXPIRATION_TIME, timeAgo } from '../../../utils'
import { Badge } from '../../badge'
import { CredentialActions } from './actions'
import { VaultBadge } from '../../vaults/badge'
import { Link } from 'solito/link'
import { CredentialTypeDisplay } from '../types'

export function CredentialDisplay({
  credential,
  onPress,
}: { credential: CredentialWithId; onPress?: () => void }) {
  const isExpired =
    credential.verified_at &&
    new Date(credential.verified_at).getTime() + CREDENTIAL_EXPIRATION_TIME < Date.now()
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
        px: '$2',
        py: '$3',
      }}
      onPress={onPress}
      hoverStyle={onPress ? { bg: '$color3' } : {}}
      cursor={onPress ? 'pointer' : undefined}
      fs={1}
    >
      <XStack ai="center" gap="$2">
        <Link href={`/profiles/${credential.vault_id}`}>
          <VaultBadge vaultId={credential.vault_id} />
        </Link>
        <Badge>{getCredential(credential.type)?.name}</Badge>
        <Badge>{timeAgo(credential.verified_at.toString())}</Badge>
        {isExpired && <Badge destructive>Expired</Badge>}
      </XStack>
      <CredentialTypeDisplay credential={credential} />
      <View position="absolute" top="$2" right="$3" $xs={{ right: '$2' }}>
        <CredentialActions credential={credential} />
      </View>
    </YStack>
  )
}

import { Credential } from '../../../types'
import { View, XStack, YStack } from '@anonworld/ui'
import { chains, CREDENTIAL_EXPIRATION_TIME, timeAgo } from '../../../utils'
import { Badge } from '../../badge'
import { CredentialActions } from './actions'
import { useToken } from '../../../hooks'
import { extractChain, formatUnits } from 'viem/utils'
import { Field } from '../../field'
import { VaultBadge } from '../../vaults/badge'
import { Link } from 'solito/link'

export function CredentialDisplay({
  credential,
  onPress,
}: { credential: Credential; onPress?: () => void }) {
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
      f={1}
    >
      <XStack ai="center" gap="$2">
        <Link href={`/profiles/${credential.vault_id}`}>
          <VaultBadge vaultId={credential.vault_id} />
        </Link>
        <Badge>ERC20 Balance</Badge>
        <Badge>{timeAgo(credential.verified_at)}</Badge>
        {isExpired && <Badge destructive>Expired</Badge>}
      </XStack>
      <ERC20CredentialDisplay credential={credential} />
      <View position="absolute" top="$2" right="$3" $xs={{ right: '$2' }}>
        <CredentialActions credential={credential} />
      </View>
    </YStack>
  )
}

function ERC20CredentialDisplay({ credential }: { credential: Credential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  const symbol = data?.symbol
  const amount = Number.parseFloat(
    formatUnits(BigInt(credential.metadata.balance), data?.decimals ?? 18)
  )

  return (
    <XStack $xs={{ flexDirection: 'column', gap: '$2', ai: 'flex-start' }}>
      {[
        {
          label: 'Token',
          value: symbol,
          image: data?.image_url,
          imageFallbackText: credential.metadata.tokenAddress,
        },
        { label: 'Balance', value: amount.toLocaleString() },
        {
          label: 'Chain',
          value: extractChain({ chains, id: Number(credential.metadata.chainId) as any })
            .name,
        },
      ].map(({ label, value, image, imageFallbackText }) => (
        <Field
          key={label}
          label={label}
          value={value}
          image={image}
          imageFallbackText={imageFallbackText}
        />
      ))}
    </XStack>
  )
}

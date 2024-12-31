import { Credential } from '../../../types'
import { View, XStack, YStack } from '@anonworld/ui'
import { chains, timeAgo } from '../../../utils'
import { Badge } from '../../badge'
import { CredentialActions } from './actions'
import { useToken } from '../../../hooks'
import { extractChain, formatUnits } from 'viem/utils'
import { Field } from '../../field'
import { VaultBadge } from '../../auth/vault'

export function CredentialDisplay({
  credential,
  onPress,
}: { credential: Credential; onPress?: () => void }) {
  return (
    <YStack
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bbw="$0.5"
      p="$3"
      gap="$4"
      $gtXs={{
        br: '$4',
        bw: '$0.5',
      }}
      onPress={onPress}
      hoverStyle={onPress ? { bg: '$color3' } : {}}
      cursor={onPress ? 'pointer' : undefined}
      f={1}
    >
      <XStack ai="center" gap="$2">
        <VaultBadge vaultId={credential.vault_id} />
        <Badge>ERC20 Balance</Badge>
        <Badge>{timeAgo(credential.verified_at)}</Badge>
      </XStack>
      <ERC20CredentialDisplay credential={credential} />
      <View position="absolute" top="$2" right="$3">
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
    <XStack>
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

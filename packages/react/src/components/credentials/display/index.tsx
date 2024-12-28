import { Credential } from '../../../types'
import { View, XStack, YStack } from '@anonworld/ui'
import { chains, formatHexId, timeAgo } from '../../../utils'
import { Badge } from '../../badge'
import { CredentialActions } from './actions'
import { useToken } from '../../../hooks'
import { extractChain, formatUnits } from 'viem/utils'
import { CredentialAvatar } from './id'
import { Field } from '../../field'

export function CredentialDisplay({ credential }: { credential: Credential }) {
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
      f={1}
    >
      <XStack ai="center" gap="$2">
        <CredentialAvatar id={formatHexId(credential.id)} size="$1" />
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

  const symbol = data?.attributes.symbol
  const implementation = data?.attributes.implementations[0]
  const amount = Number.parseFloat(
    formatUnits(BigInt(credential.metadata.balance), implementation?.decimals ?? 18)
  )

  return (
    <XStack>
      {[
        { label: 'Token', value: symbol, image: data?.attributes.icon.url },
        { label: 'Balance', value: amount.toLocaleString() },
        {
          label: 'Chain',
          value: extractChain({ chains, id: Number(credential.metadata.chainId) as any })
            .name,
        },
      ].map(({ label, value, image }) => (
        <Field key={label} label={label} value={value} image={image} />
      ))}
    </XStack>
  )
}

import { ERC20BalanceCredential, getChain } from '@anonworld/common'
import { XStack } from '@anonworld/ui'
import { useToken } from '../../../../hooks'
import { formatUnits } from 'viem/utils'
import { Field } from '../../../field'

export function ERC20BalanceDisplay({
  credential,
}: { credential: ERC20BalanceCredential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  const symbol = data?.symbol
  const amount = Number.parseFloat(
    formatUnits(BigInt(credential.metadata.balance), data?.decimals ?? 18)
  )
  const chain = getChain(Number(credential.metadata.chainId))

  return (
    <XStack gap="$4" $xs={{ flexDirection: 'column', gap: '$2', ai: 'flex-start' }}>
      {[
        {
          label: 'Token',
          value: symbol,
          image: data?.image_url ?? undefined,
          imageFallbackText: credential.metadata.tokenAddress,
        },
        {
          label: 'Chain',
          value: chain.name,
          image: chain.imageUrl,
        },
        { label: 'Balance', value: amount.toLocaleString() },
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

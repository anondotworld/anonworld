import { ERC721BalanceCredential, getChain } from '@anonworld/common'
import { XStack } from '@anonworld/ui'
import { useToken } from '../../../../hooks'
import { Field } from '../../../field'

export function ERC721BalanceDisplay({
  credential,
}: { credential: ERC721BalanceCredential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  const chain = getChain(Number(credential.metadata.chainId))

  return (
    <XStack gap="$4" $xs={{ flexDirection: 'column', gap: '$2', ai: 'flex-start' }}>
      {[
        {
          label: 'NFT',
          value: data?.name,
          image: data?.image_url ?? undefined,
          imageFallbackText: credential.metadata.tokenAddress,
        },
        {
          label: 'Chain',
          value: chain.name,
          image: chain.imageUrl,
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

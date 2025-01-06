import { ERC721BalanceCredential } from '@anonworld/common'
import { useToken } from '../../../../hooks'
import { Text, XStack } from '@anonworld/ui'
import { TokenImage } from '../../../tokens/image'

export function ERC721BalanceSelect({
  credential,
}: { credential: ERC721BalanceCredential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  return (
    <XStack gap="$2" ai="center" jc="space-between" f={1}>
      <TokenImage
        token={{
          address: credential.metadata.tokenAddress,
          image_url: data?.image_url ?? undefined,
        }}
      />
      <Text fos="$2" fow="500">
        {`${data?.name} Holder`}
      </Text>
    </XStack>
  )
}

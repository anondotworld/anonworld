import { CredentialWithId } from '@anonworld/common'
import { useToken } from '../../../../hooks'
import { formatUnits } from 'viem/utils'
import { Text, XStack } from '@anonworld/ui'
import { TokenImage } from '../../../tokens/image'

export function ERC20BalanceSelect({ credential }: { credential: CredentialWithId }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  const symbol = data?.symbol
  const amount = Number.parseFloat(
    formatUnits(BigInt(credential.metadata.balance), data?.decimals ?? 18)
  )

  return (
    <XStack gap="$2" ai="center" jc="space-between" f={1}>
      <TokenImage
        token={{
          address: credential.metadata.tokenAddress,
          image_url: data?.image_url ?? undefined,
        }}
      />
      <Text fos="$2" fow="500">
        {`${amount.toLocaleString()} ${symbol}`}
      </Text>
    </XStack>
  )
}

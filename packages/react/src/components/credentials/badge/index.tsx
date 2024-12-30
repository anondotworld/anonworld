import { Credential, Token } from '../../../types'
import { formatAmount } from '../../../utils'
import { Coins } from '@tamagui/lucide-icons'
import { Badge } from '../../badge'
import { formatUnits } from 'viem/utils'
import { Image } from '@anonworld/ui'
import { useToken } from '../../../hooks'

export function CredentialBadge({ credential }: { credential: Credential }) {
  if (!credential.metadata?.balance) return null

  if (!credential.token) {
    return <ERC20CredentialBadgeWithToken credential={credential} />
  }

  return (
    <ERC20CredentialBadge
      balance={credential.metadata.balance}
      token={credential.token}
    />
  )
}

function ERC20CredentialBadgeWithToken({ credential }: { credential: Credential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  if (!data) return null

  return <ERC20CredentialBadge balance={credential.metadata.balance} token={data} />
}

function ERC20CredentialBadge({ balance, token }: { balance: string; token: Token }) {
  const symbol = token?.symbol
  const amount = Number.parseFloat(formatUnits(BigInt(balance), token?.decimals ?? 18))

  return (
    <Badge
      icon={
        token?.image_url ? (
          <Image src={token.image_url} w={16} h={16} />
        ) : (
          <Coins size={12} />
        )
      }
    >{`${formatAmount(amount)} ${symbol}`}</Badge>
  )
}

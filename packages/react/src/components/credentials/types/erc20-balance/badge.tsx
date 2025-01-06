import { ERC20BalanceCredential, Token } from '@anonworld/common'
import { formatAmount } from '@anonworld/common'
import { Badge } from '../../../badge'
import { formatUnits } from 'viem/utils'
import { useToken } from '../../../../hooks'
import { TokenImage } from '../../../tokens/image'

export function ERC20BalanceBadge({
  credential,
}: { credential: ERC20BalanceCredential }) {
  if (!credential.token) {
    return <ERC20BalanceBadgeWithToken credential={credential} />
  }

  return (
    <ERC20BalanceBadgeBase
      balance={credential.metadata.balance}
      token={credential.token}
    />
  )
}

function ERC20BalanceBadgeWithToken({
  credential,
}: { credential: ERC20BalanceCredential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  if (!data) return null

  return <ERC20BalanceBadgeBase balance={credential.metadata.balance} token={data} />
}

function ERC20BalanceBadgeBase({ balance, token }: { balance: string; token: Token }) {
  const symbol = token?.symbol
  const amount = Number.parseFloat(formatUnits(BigInt(balance), token?.decimals ?? 18))

  return (
    <Badge
      icon={<TokenImage token={token} />}
    >{`${formatAmount(amount)}+ ${symbol}`}</Badge>
  )
}

import { Credential, Token } from '@anonworld/common'
import { Badge } from '../../../badge'
import { useToken } from '../../../../hooks'
import { TokenImage } from '../../../tokens/image'

export function ERC721BalanceBadge({ credential }: { credential: Credential }) {
  if (!credential.token) {
    return <ERC721BalanceBadgeWithToken credential={credential} />
  }

  return <ERC721BalanceBadgeBase token={credential.token} />
}

function ERC721BalanceBadgeWithToken({ credential }: { credential: Credential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  if (!data) return null

  return <ERC721BalanceBadgeBase token={data} />
}

function ERC721BalanceBadgeBase({ token }: { token: Token }) {
  return <Badge icon={<TokenImage token={token} />}>{`${token.name} Holder`}</Badge>
}

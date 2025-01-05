import {
  Action,
  Credential,
  CredentialRequirement,
  CredentialType,
  CredentialWithId,
} from '@anonworld/common'
import { ERC20BalanceDisplay } from './erc20-balance/display'
import { ERC20BalanceRequirement } from './erc20-balance/requirement'
import { ERC20BalanceBadge } from './erc20-balance/badge'
import { ERC20BalanceSelect } from './erc20-balance/select'
import { ERC721BalanceDisplay } from './erc721-balance/display'
import { ERC721BalanceRequirement } from './erc721-balance/requirement'
import { ERC721BalanceBadge } from './erc721-balance/badge'
import { ERC721BalanceSelect } from './erc721-balance/select'

export function CredentialTypeDisplay({ credential }: { credential: CredentialWithId }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceDisplay credential={credential} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceDisplay credential={credential} />
    default:
      return null
  }
}

export function CredentialTypeRequirement({
  action,
  req,
}: {
  action: Action
  req: CredentialRequirement
}) {
  const type = action.credential_id?.split(':')[0]
  switch (type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceRequirement action={action} req={req} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceRequirement action={action} req={req} />
    default:
      return null
  }
}

export function CredentialTypeBadge({ credential }: { credential: Credential }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceBadge credential={credential} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceBadge credential={credential} />
    default:
      return null
  }
}

export function CredentialTypeSelect({ credential }: { credential: CredentialWithId }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceSelect credential={credential} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceSelect credential={credential} />
    default:
      return null
  }
}

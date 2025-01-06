import { View } from '@anonworld/ui'
import { CredentialType } from '@anonworld/common'
import { ERC20CredentialForm } from './erc20-balance'
import { ERC721CredentialForm } from './erc721-balance'
import { FarcasterFidForm } from './farcaster-fid'

export function NewCredentialForm({
  credentialType,
  initialTokenId,
  initialBalance,
  isOpen,
  setIsOpen,
}: {
  credentialType: CredentialType
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  if (credentialType === CredentialType.ERC20_BALANCE) {
    return (
      <ERC20CredentialForm
        initialTokenId={initialTokenId}
        initialBalance={initialBalance}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    )
  }
  if (credentialType === CredentialType.ERC721_BALANCE) {
    return (
      <ERC721CredentialForm
        initialTokenId={initialTokenId}
        initialBalance={initialBalance}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    )
  }
  if (credentialType === CredentialType.FARCASTER_FID) {
    return <FarcasterFidForm isOpen={isOpen} setIsOpen={setIsOpen} />
  }
  return <View />
}

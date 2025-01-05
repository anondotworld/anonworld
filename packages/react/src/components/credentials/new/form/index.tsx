import { View } from '@anonworld/ui'
import { CredentialType } from '@anonworld/common'
import { useNewCredential } from '../context'
import { ERC20CredentialForm } from './erc20-balance'
import { ERC721CredentialForm } from './erc721-balance'

export function NewCredentialForm() {
  const { credentialType } = useNewCredential()
  if (credentialType === CredentialType.ERC20_BALANCE) {
    return <ERC20CredentialForm />
  }
  if (credentialType === CredentialType.ERC721_BALANCE) {
    return <ERC721CredentialForm />
  }
  return <View />
}

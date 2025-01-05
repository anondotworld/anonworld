import { CredentialType } from './types'

export const erc20Balance = {
  type: CredentialType.ERC20_BALANCE,
  name: 'ERC20 Balance',
}

export const erc721Balance = {
  type: CredentialType.ERC721_BALANCE,
  name: 'ERC721 Owner',
}

export const credentials = [erc20Balance, erc721Balance]

export const getCredential = (type: CredentialType) => {
  return credentials.find((credential) => credential.type === type)
}

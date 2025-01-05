import { Token } from './token'

export enum CredentialType {
  ERC20_BALANCE = 'ERC20_BALANCE',
  ERC721_BALANCE = 'ERC721_BALANCE',
}

export type CredentialProof = {
  proof: number[]
  publicInputs: string[]
}

export type ProofData = {
  proof: Uint8Array
  publicInputs: string[]
}

export type CredentialMetadata = {
  chainId: number
  tokenAddress: string
  balance: string
}

export type Credential = {
  id?: string
  type: CredentialType
  credential_id: string
  proof?: CredentialProof
  metadata: CredentialMetadata
  verified_at: string | Date
  token?: Token
  vault_id: string | null
  parent_id: string | null
}

export type CredentialWithId = Credential & { id: string }

import { Token } from './token'

export enum CredentialType {
  ERC20_BALANCE = 'erc20_balance',
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
  credential_id: string
  proof?: CredentialProof
  metadata: CredentialMetadata
  verified_at: string | Date
  token?: Token
  vault_id: string | null
  parent_id: string | null
}

export type CredentialWithId = Credential & { id: string }

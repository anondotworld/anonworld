import { Token } from './token'

export enum CredentialType {
  ERC20_BALANCE = 'erc20_balance',
}

export type Credential = {
  id?: string
  credential_id: string
  proof?: {
    proof: number[]
    publicInputs: string[]
  }
  metadata: {
    chainId: number
    tokenAddress: string
    balance: string
  }
  verified_at: string
  token?: Token
  vault_id: string | null
}

export type CredentialWithId = Credential & { id: string }

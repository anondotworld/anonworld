import { Token } from './token'

export enum CredentialType {
  ERC20_BALANCE = 'ERC20_BALANCE',
  ERC721_BALANCE = 'ERC721_BALANCE',
  FARCASTER_FID = 'FARCASTER_FID',
}

export type CredentialProof = {
  proof: number[]
  publicInputs: string[]
}

export type ProofData = {
  proof: Uint8Array
  publicInputs: string[]
}

export type TokenBalanceMetadata = {
  chainId: number
  tokenAddress: string
  balance: string
}

export type FarcasterFidMetadata = {
  fid: number
}

type BaseCredential = {
  id?: string
  credential_id: string
  proof?: CredentialProof
  verified_at: string | Date
  token?: Token
  vault_id: string | null
  parent_id: string | null
}

export type ERC20BalanceCredential = BaseCredential & {
  type: CredentialType.ERC20_BALANCE
  metadata: TokenBalanceMetadata
}

export type ERC721BalanceCredential = BaseCredential & {
  type: CredentialType.ERC721_BALANCE
  metadata: TokenBalanceMetadata
}

export type FarcasterFidCredential = BaseCredential & {
  type: CredentialType.FARCASTER_FID
  metadata: FarcasterFidMetadata
}

export type Credential =
  | ERC20BalanceCredential
  | ERC721BalanceCredential
  | FarcasterFidCredential

export type CredentialWithId = Credential & { id: string }

export type ERC20CredentialRequirement = {
  chainId: number
  tokenAddress: `0x${string}`
  minimumBalance: string
}

export type ERC721CredentialRequirement = {
  chainId: number
  tokenAddress: `0x${string}`
  minimumBalance: string
}

export type FarcasterFidCredentialRequirement = {
  fid: number
}

export type CredentialRequirement =
  | ERC20CredentialRequirement
  | ERC721CredentialRequirement
  | FarcasterFidCredentialRequirement

export type CredentialRequirementTypeMap = {
  [CredentialType.ERC20_BALANCE]: ERC20CredentialRequirement
  [CredentialType.ERC721_BALANCE]: ERC721CredentialRequirement
  [CredentialType.FARCASTER_FID]: FarcasterFidCredentialRequirement
}

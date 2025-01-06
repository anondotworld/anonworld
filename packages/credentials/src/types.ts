import { CredentialType } from '@anonworld/common'
import { FarcasterFidArgs, FarcasterFidPublicData } from './verifiers/farcaster-fid'
import { TokenBalanceArgs, TokenBalancePublicData } from './verifiers/token-balance'

export type CredentialPublicData = FarcasterFidPublicData | TokenBalancePublicData

export type CredentialArgsTypeMap = {
  [CredentialType.FARCASTER_FID]: FarcasterFidArgs
  [CredentialType.ERC20_BALANCE]: TokenBalanceArgs
  [CredentialType.ERC721_BALANCE]: TokenBalanceArgs
}

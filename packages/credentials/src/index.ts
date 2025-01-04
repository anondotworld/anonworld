import { CredentialType } from '@anonworld/common'
import { ERC20BalanceVerifier } from './verifiers/erc20-balance'
import { Verifier } from './verifiers/verifier'
export type { Circuit } from './utils/circuit'

type VerifierConstructor = new (version: string) => Verifier

const Verifiers: Record<CredentialType, VerifierConstructor> = {
  [CredentialType.ERC20_BALANCE]: ERC20BalanceVerifier,
}

export class CredentialsManager {
  private verifiers: Record<string, Record<string, Verifier>> = {}

  getVerifier<T extends CredentialType>(circuitType: T, circuitVersion = 'latest') {
    if (!this.verifiers[circuitType]) {
      this.verifiers[circuitType] = {}
    }

    if (this.verifiers[circuitType][circuitVersion]) {
      return this.verifiers[circuitType][circuitVersion]
    }

    const VerifierClass = Verifiers[circuitType]
    if (!VerifierClass) {
      throw new Error('Invalid circuit type')
    }

    this.verifiers[circuitType][circuitVersion] = new VerifierClass(circuitVersion)

    return this.verifiers[circuitType][circuitVersion]
  }
}

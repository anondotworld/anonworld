import { CredentialType } from '@anonworld/common'
import { CredentialArgsTypeMap, CredentialPublicData } from '../types'

export abstract class Verifier {
  abstract type: CredentialType
  abstract version: string
  abstract buildInput(args: CredentialArgsTypeMap[CredentialType]): Promise<any>
  abstract generateProof(args: any): Promise<{
    type: CredentialType
    version: string
    proof: number[]
    publicInputs: string[]
  }>
  abstract verifyProof(proof: any): Promise<boolean>
  abstract parseData(inputs: any): CredentialPublicData
}

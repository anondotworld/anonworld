import { CredentialType } from '@anonworld/common'

export abstract class Verifier {
  abstract type: CredentialType
  abstract version: string
  abstract buildInput(args: any): Promise<any>
  abstract generateProof(args: any): Promise<{
    type: CredentialType
    version: string
    proof: number[]
    publicInputs: string[]
  }>
  abstract verifyProof(proof: any): Promise<boolean>
  abstract parseData(inputs: any): any
}

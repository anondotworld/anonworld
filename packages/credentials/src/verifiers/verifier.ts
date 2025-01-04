export abstract class Verifier {
  abstract version: string
  abstract buildInput(args: any): Promise<any>
  abstract generateProof(args: any): Promise<any>
  abstract verifyProof(proof: any): Promise<any>
  abstract parseData(inputs: any): any
}

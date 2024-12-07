import permissionedActionCircuit from '../circuits/permissioned-action/target/main.json'
import permissionedActionVkey from '../circuits/permissioned-action/target/vkey.json'
import { CompiledCircuit, type Noir } from '@noir-lang/noir_js'
import { UltraHonkBackend, BarretenbergVerifier, ProofData } from '@aztec/bb.js'
import { BarretenbergSync, Fr } from '@aztec/bb.js'
export type { ProofData } from '@aztec/bb.js'

type ProverModules = {
  Noir: typeof Noir
  UltraHonkBackend: typeof UltraHonkBackend
}

type VerifierModules = {
  BarretenbergVerifier: typeof BarretenbergVerifier
}

export const buildHashFunction = async () => {
  const bb = await BarretenbergSync.new()
  return (a: string, b: string) =>
    bb.poseidon2Hash([Fr.fromString(a), Fr.fromString(b)]).toString()
}

export enum Circuit {
  PERMISSIONED_ACTION,
}

export class ProofManager {
  private proverPromise: Promise<ProverModules> | null = null
  private verifierPromise: Promise<VerifierModules> | null = null
  private circuit: CompiledCircuit
  private vkey: Uint8Array

  constructor(circuit: Circuit) {
    switch (circuit) {
      case Circuit.PERMISSIONED_ACTION:
        this.circuit = permissionedActionCircuit as CompiledCircuit
        this.vkey = Uint8Array.from(permissionedActionVkey)
        break
    }
  }

  async initProver(): Promise<ProverModules> {
    if (!this.proverPromise) {
      this.proverPromise = (async () => {
        const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
          import('@noir-lang/noir_js'),
          import('@aztec/bb.js'),
        ])
        return {
          Noir,
          UltraHonkBackend,
        }
      })()
    }
    return this.proverPromise
  }

  async initVerifier(): Promise<VerifierModules> {
    if (!this.verifierPromise) {
      this.verifierPromise = (async () => {
        const { BarretenbergVerifier } = await import('@aztec/bb.js')
        return { BarretenbergVerifier }
      })()
    }
    return this.verifierPromise
  }

  async verify(proofData: ProofData) {
    const { BarretenbergVerifier } = await this.initVerifier()

    const verifier = new BarretenbergVerifier({ crsPath: process.env.TEMP_DIR })
    const result = await verifier.verifyUltraHonkProof(proofData, this.vkey)

    return result
  }

  async generate(input: any) {
    const { Noir, UltraHonkBackend } = await this.initProver()

    const backend = new UltraHonkBackend(this.circuit.bytecode)
    const noir = new Noir(this.circuit)

    const { witness } = await noir.execute(input)

    return await backend.generateProof(witness)
  }

  async extractData(publicInputs: string[]) {
    const root = publicInputs[0]
    const dataHash =
      '0x' +
      publicInputs
        .slice(1)
        .map((hex) => Number.parseInt(hex, 16).toString(16).padStart(2, '0'))
        .join('')

    return { root, dataHash }
  }
}

export const permissionedAction = new ProofManager(Circuit.PERMISSIONED_ACTION)

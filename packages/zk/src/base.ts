import { CompiledCircuit, type Noir } from '@noir-lang/noir_js'
import { UltraHonkBackend, BarretenbergVerifier, ProofData } from '@aztec/bb.js'
export type { ProofData } from '@aztec/bb.js'

type ProverModules = {
  Noir: typeof Noir
  UltraHonkBackend: typeof UltraHonkBackend
}

type VerifierModules = {
  BarretenbergVerifier: typeof BarretenbergVerifier
}

export abstract class BaseCircuit {
  private proverPromise: Promise<ProverModules> | null = null
  private verifierPromise: Promise<VerifierModules> | null = null
  private circuit: CompiledCircuit
  private vkey: Uint8Array

  constructor(circuit: unknown, vkey: number[]) {
    this.circuit = circuit as CompiledCircuit
    this.vkey = Uint8Array.from(vkey)
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
    if (!this.circuit) {
      throw new Error('Circuit not initialized')
    }

    const { BarretenbergVerifier } = await this.initVerifier()

    const verifier = new BarretenbergVerifier({ crsPath: process.env.TEMP_DIR })
    const result = await verifier.verifyUltraHonkProof(proofData, this.vkey)

    return result
  }

  async generate(input: Record<string, any>) {
    if (!this.circuit) {
      throw new Error('Circuit not initialized')
    }

    const { Noir, UltraHonkBackend } = await this.initProver()

    const backend = new UltraHonkBackend(this.circuit.bytecode)
    const noir = new Noir(this.circuit)

    const { witness } = await noir.execute(input)

    return await backend.generateProof(witness)
  }
}

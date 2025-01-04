import { CompiledCircuit, type Noir } from '@noir-lang/noir_js'
import { UltraHonkBackend, BarretenbergVerifier, ProofData } from '@aztec/bb.js'
export type { ProofData } from '@aztec/bb.js'

export enum CircuitType {
  ERC20_BALANCE = 'ERC20_BALANCE',
}

type ProverModules = {
  Noir: typeof Noir
  UltraHonkBackend: typeof UltraHonkBackend
}

type VerifierModules = {
  BarretenbergVerifier: typeof BarretenbergVerifier
}

type CircuitModules = {
  circuit: CompiledCircuit
  vkey: Uint8Array
}

export abstract class Circuit {
  private proverPromise: Promise<ProverModules> | null = null
  private verifierPromise: Promise<VerifierModules> | null = null
  private circuitPromise: Promise<CircuitModules> | null = null

  public key: string
  public version: string
  public type: CircuitType

  constructor(circuitKey: string, circuitVersion: string, circuitType: CircuitType) {
    this.key = circuitKey
    this.version = circuitVersion
    this.type = circuitType
  }

  async initCircuit() {
    if (!this.circuitPromise) {
      this.circuitPromise = (async () => {
        const [circuit, vkey] = await Promise.all([
          import(`./${this.key}/circuit/target/${this.version}/main.json`).then(
            (res) => res.default
          ),
          import(`./${this.key}/circuit/target/${this.version}/vkey.json`).then(
            (res) => res.default
          ),
        ])
        return { circuit, vkey }
      })()
    }
    return this.circuitPromise
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
    const [{ vkey }, { BarretenbergVerifier }] = await Promise.all([
      this.initCircuit(),
      this.initVerifier(),
    ])

    const verifier = new BarretenbergVerifier({ crsPath: process.env.TEMP_DIR })
    const result = await verifier.verifyUltraHonkProof(proofData, vkey)

    return result
  }

  async generate(input: Record<string, any>) {
    const [{ circuit }, { Noir, UltraHonkBackend }] = await Promise.all([
      this.initCircuit(),
      this.initProver(),
    ])

    const backend = new UltraHonkBackend(circuit.bytecode)
    const noir = new Noir(circuit)

    const { witness } = await noir.execute(input)

    return await backend.generateProof(witness)
  }

  abstract parseData(publicInputs: string[]): any
}

import { createElysia } from '../utils'
import { t } from 'elysia'
import {
  createCredentialInstance,
  deleteCredentialInstance,
  getCredentialInstance,
} from '@anonworld/db'
import { CircuitType, getCircuit } from '@anonworld/zk'
import {
  createPublicClient,
  keccak256,
  http,
  zeroAddress,
  pad,
  concat,
  toHex,
} from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http(),
})

export const credentialsRoutes = createElysia({ prefix: '/credentials' })
  .post(
    '/',
    async ({ body }) => {
      if (!body.type || !body.version) {
        throw new Error('Invalid type or version')
      }

      const circuit = getCircuit(body.type as CircuitType, body.version)

      const verified = await circuit.verify({
        proof: new Uint8Array(body.proof),
        publicInputs: body.publicInputs,
      })
      if (!verified) {
        throw new Error('Invalid proof')
      }

      const metadata = circuit.parseData(body.publicInputs)
      const credentialId = `${body.type}:${metadata.chainId}:${metadata.tokenAddress}`
      const id = keccak256(new Uint8Array(body.proof))
      const existingCredential = await getCredentialInstance(id)
      if (existingCredential) {
        return {
          ...existingCredential,
          proof: undefined,
        }
      }

      const block = await client.getBlock({ blockNumber: BigInt(metadata.blockNumber) })
      const ethProof = await client.getProof({
        address: metadata.tokenAddress,
        storageKeys: [
          keccak256(concat([pad(zeroAddress), pad(toHex(metadata.balanceSlot))])),
        ],
        blockNumber: BigInt(metadata.blockNumber),
      })

      if (ethProof.storageHash !== metadata.storageHash) {
        throw new Error('Invalid storage hash')
      }

      const credential = await createCredentialInstance({
        id,
        credential_id: credentialId,
        metadata,
        version: circuit.version,
        proof: {
          proof: body.proof,
          publicInputs: body.publicInputs,
        },
        verified_at: new Date(Number(block.timestamp) * 1000),
        vault_id: body.vaultId,
      })

      return {
        ...credential,
        proof: undefined,
      }
    },
    {
      body: t.Object({
        type: t.String(),
        version: t.String(),
        proof: t.Array(t.Number()),
        publicInputs: t.Array(t.String()),
        vaultId: t.Optional(t.String()),
      }),
    }
  )
  .delete('/:id', async ({ params }) => {
    await deleteCredentialInstance(params.id)
    return {
      success: true,
    }
  })
  .get('/:id', async ({ params }) => {
    const credential = await getCredentialInstance(params.id)
    return {
      ...credential,
    }
  })

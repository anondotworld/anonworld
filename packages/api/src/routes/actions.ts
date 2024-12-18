import { createElysia } from '../utils'
import { t } from 'elysia'
import {
  createCredentialInstance,
  CredentialInstance,
  getAction,
  getCredentialInstance,
} from '@anonworld/db'
import { CreatePost } from '../actions/create-post'
import { CopyPostFarcaster } from '../actions/copy-post-farcaster'
import { CopyPostTwitter } from '../actions/copy-post-twitter'
import { DeletePostTwitter } from '../actions/delete-post-twitter'
import { DeletePostFarcaster } from '../actions/delete-post-farcaster'
import { BaseAction } from '../actions/base'
import { ActionRequest, ActionType } from '../actions/types'
import { erc20Balance } from '@anonworld/zk'
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

async function getActionCredentials(
  proofs: { proof: number[]; publicInputs: string[] }[]
) {
  const credentials: CredentialInstance[] = []

  for (const proof of proofs) {
    const verified = await erc20Balance.verify({
      proof: new Uint8Array(proof.proof),
      publicInputs: proof.publicInputs,
    })
    if (!verified) {
      throw new Error('Invalid proof')
    }
    const metadata = erc20Balance.parseData(proof.publicInputs)
    const credentialId = `ERC20_BALANCE:${metadata.chainId}:${metadata.tokenAddress}`
    const id = keccak256(new Uint8Array(proof.proof))
    let credential = await getCredentialInstance(id)
    if (!credential) {
      const block = await client.getBlock({ blockNumber: BigInt(metadata.blockNumber) })
      const ethProof = await client.getProof({
        address: metadata.tokenAddress,
        storageKeys: [
          keccak256(concat([pad(zeroAddress), pad(toHex(metadata.balanceSlot))])),
        ],
        blockNumber: BigInt(metadata.blockNumber),
      })

      if (ethProof.storageHash !== metadata.storageHash) {
        continue
      }

      credential = await createCredentialInstance({
        id,
        credential_id: credentialId,
        metadata,
        proof,
        verified_at: new Date(Number(block.timestamp) * 1000),
      })
    }
    credentials.push(credential)
  }

  return credentials
}

async function getActionInstance(request: ActionRequest) {
  const action = await getAction(request.actionId)

  let actionInstance: BaseAction | undefined

  const credentials: CredentialInstance[] = request.credentials || []

  if (request.proofs) {
    credentials.push(...(await getActionCredentials(request.proofs)))
  }

  if (
    action.credential_id &&
    !credentials.some((credential) => credential.credential_id === action.credential_id)
  ) {
    throw new Error('Missing required credential')
  }

  switch (action.type) {
    case ActionType.CREATE_POST: {
      actionInstance = new CreatePost(action, request.data, credentials)
      break
    }
    case ActionType.COPY_POST_TWITTER: {
      actionInstance = new CopyPostTwitter(action, request.data, credentials)
      break
    }
    case ActionType.COPY_POST_FARCASTER: {
      actionInstance = new CopyPostFarcaster(action, request.data, credentials)
      break
    }
    case ActionType.DELETE_POST_TWITTER: {
      actionInstance = new DeletePostTwitter(action, request.data, credentials)
      break
    }
    case ActionType.DELETE_POST_FARCASTER: {
      actionInstance = new DeletePostFarcaster(action, request.data, credentials)
      break
    }
  }

  return actionInstance
}

export const actionsRoutes = createElysia({ prefix: '/actions' })
  .get(
    '/:actionId',
    async ({ params }) => {
      const action = await getAction(params.actionId)
      return action
    },
    {
      params: t.Object({
        actionId: t.String(),
      }),
    }
  )
  .post(
    '/execute',
    async ({ body }) => {
      const results: { success: boolean; error?: string }[] = []
      const nextActions: ActionRequest[] = []
      for (const action of body.actions) {
        try {
          const actionInstance = await getActionInstance(action)
          if (!actionInstance) {
            throw new Error('Invalid action')
          }

          const response = await actionInstance.execute()
          results.push(response)

          const next = await actionInstance.next()
          if (next.length > 0) {
            nextActions.push(...next)
          }
        } catch (error) {
          results.push({ success: false, error: (error as Error).message })
        }
      }

      for (const action of nextActions) {
        try {
          const actionInstance = await getActionInstance(action)
          if (!actionInstance) {
            throw new Error('Invalid action')
          }

          const response = await actionInstance.execute()
          results.push(response)
        } catch (error) {
          results.push({ success: false, error: (error as Error).message })
        }
      }

      const outOfMemoryResult = results.find((result) =>
        result.error?.toLowerCase().includes('out of memory')
      )
      if (outOfMemoryResult) {
        throw new Error(outOfMemoryResult.error)
      }

      return { results }
    },
    {
      body: t.Object({
        actions: t.Array(
          t.Object({
            actionId: t.String(),
            data: t.Any(),
            proofs: t.Array(
              t.Object({
                proof: t.Array(t.Number()),
                publicInputs: t.Array(t.String()),
              })
            ),
          })
        ),
      }),
    }
  )

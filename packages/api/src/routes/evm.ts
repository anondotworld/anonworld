import { createElysia } from '../utils'
import { concat, hexToNumber, keccak256, pad, toHex } from 'viem'
import { simplehash } from '../services/simplehash'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { db } from '../db'
import { getChain } from '@anonworld/common'
import { tokens } from '../services/tokens'
import { ContractType, StorageType } from '@anonworld/common'

export const evmRoutes = createElysia({ prefix: '/evm' }).post(
  '/storage-slot',
  async ({ body, error }) => {
    const chainId = body.chainId
    const contractAddress = body.contractAddress
    const contractType = body.contractType as ContractType
    const storageType = body.storageType as StorageType

    let cached = await redis.getStorageSlot(chainId, contractAddress, storageType)
    if (cached) {
      return {
        slot: hexToNumber(cached as `0x${string}`),
      }
    }

    let holder: { address: string; balance: bigint } | null = null

    let slot: number | null = null
    if (contractType === ContractType.ERC20) {
      holder = await simplehash.getTopTokenHolder(chainId, contractAddress)
    }
    if (contractType === ContractType.ERC721) {
      holder = await simplehash.getTopNFTHolder(chainId, contractAddress)
    }

    if (!holder) return error(404, 'Failed to find balance storage slot')

    slot = await getStorageSlot(chainId, contractAddress, holder.address, holder.balance)

    if (slot === null) return error(404, 'Failed to find balance storage slot')

    if (contractType === ContractType.ERC20) {
      await tokens.getOrCreateERC20(chainId, contractAddress)
    } else if (contractType === ContractType.ERC721) {
      await tokens.getOrCreateERC721(chainId, contractAddress)
    }

    await db.tokens.update(`${chainId}:${contractAddress}`, {
      balance_slot: slot,
    })

    await redis.setStorageSlot(chainId, contractAddress, StorageType.BALANCE, toHex(slot))

    return { slot }
  },
  {
    body: t.Object({
      chainId: t.Number(),
      contractAddress: t.String(),
      contractType: t.String(),
      storageType: t.String(),
    }),
  }
)

async function getStorageSlot(
  chainId: number,
  contractAddress: string,
  walletAddress: string,
  value: bigint
) {
  const chain = getChain(chainId)

  for (let slot = 0; slot < 50; slot++) {
    const storageKey = keccak256(
      concat([pad(walletAddress as `0x${string}`), pad(toHex(slot))])
    )
    const data = await chain.client.getStorageAt({
      address: contractAddress as `0x${string}`,
      slot: storageKey,
    })
    if (data && BigInt(data) === value) {
      return slot
    }
  }

  return null
}

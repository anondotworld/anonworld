import { buildMimc7 as buildMimc } from 'circomlibjs'
import { MerkleTreeMiMC, MiMC7 } from '../proofs/merkle-tree'
import { Redis } from 'ioredis'
import { ProofType, Tree } from '../proofs'

const redis = new Redis(process.env.REDIS_URL as string)

interface BuildTreeArgs {
  tokenAddress: string
  minAmount: string
  maxAmount?: string
}

export async function buildHoldersTree(args: BuildTreeArgs) {
  const mimc = await buildMimc()
  const merkleTree = new MerkleTreeMiMC(13, mimc)

  const owners = await fetchHolders(args)
  for (const owner of owners) {
    const commitment = MiMC7(
      mimc,
      owner.address.toLowerCase().replace('0x', ''),
      BigInt(owner.balance).toString(16).replace('0x', '')
    )
    merkleTree.insert(commitment)
  }

  const root = `0x${merkleTree.root()}`

  const elements = owners.map((owner, index) => {
    return {
      path: merkleTree.proof(index).pathElements.map((p) => `0x${p}` as string),
      address: owner.address,
      balance: owner.balance,
    }
  })

  const tree = {
    root,
    elements,
  }

  return tree
}

async function fetchHolders(args: BuildTreeArgs) {
  const owners: Array<{ address: string; balance: string }> = []

  let cursor = ''
  while (true) {
    const url = `https://api.simplehash.com/api/v0/fungibles/top_wallets?fungible_id=base.${
      args.tokenAddress
    }&limit=50${cursor ? `&cursor=${cursor}` : ''}`
    const headers = {
      Accept: 'application/json',
      'X-API-KEY': process.env.SIMPLEHASH_API_KEY ?? '',
    }

    let retries = 5
    let response

    while (retries > 0) {
      try {
        response = await fetch(url, { headers })
        if (response.ok) break
        throw new Error(`HTTP error! status: ${response.status}`)
      } catch (error) {
        retries--
        if (retries === 0) throw error
        const delay = parseInt(response?.headers.get('Retry-After') ?? '5')
        console.log(`Retrying in ${delay} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, delay * 1000))
      }
    }

    const res = await response!.json()

    let shouldBreak = false
    for (const owner of res.owners) {
      if (BigInt(owner.quantity_string) >= BigInt(args.minAmount)) {
        owners.push({
          address: owner.owner_address.toLowerCase(),
          balance: owner.quantity_string,
        })
      } else {
        shouldBreak = true
        break
      }
    }

    cursor = res.next_cursor
    if (cursor === '' || shouldBreak) {
      break
    }
  }

  return owners
}

export async function getTree(tokenAddress: string, proofType: ProofType): Promise<Tree> {
  const tree = await redis.get(`anon:tree:${tokenAddress}:${proofType}`)
  return tree ? JSON.parse(tree) : null
}

export async function setTree(tokenAddress: string, proofType: ProofType, tree: Tree) {
  await redis.set(`anon:tree:${tokenAddress}:${proofType}`, JSON.stringify(tree))
  await addRoot(tokenAddress, proofType, tree.root)
}

export async function addRoot(
  tokenAddress: string,
  proofType: ProofType,
  root: string,
  maxRoots = 5
) {
  const key = `anon:roots:${tokenAddress}:${proofType}`
  await redis.lpush(key, root)
  await redis.ltrim(key, 0, maxRoots - 1)
}

export async function getValidRoots(
  tokenAddress: string,
  proofType: ProofType
): Promise<string[]> {
  return redis.lrange(`anon:roots:${tokenAddress}:${proofType}`, 0, -1)
}

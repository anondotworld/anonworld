import { buildMimc7 as buildMimc } from 'circomlibjs'
import { MerkleTreeMiMC, MiMC7 } from '../proofs/merkle-tree'

interface BuildTreeArgs {
  tokenAddress: string
  minAmount: string
  maxAmount?: string
}

export async function buildHoldersTree(args: BuildTreeArgs) {
  const mimc = await buildMimc()
  const merkleTree = new MerkleTreeMiMC(11, mimc)

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

    const response = await fetch(url, { headers })
    const res: {
      next_cursor: string
      owners: Array<{
        fungible_id: string
        owner_address: string
        quantity: number
        quantity_string: string
        first_transferred_date: string
        last_transferred_date: string
      }>
    } = await response.json()

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

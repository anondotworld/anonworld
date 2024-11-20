// sourced from 33bits
// @ts-ignore -- no types
import { Mimc7 as MiMC } from 'circomlibjs'

export function MiMC7(mimc7: MiMC, left: string, right: string): string {
  const left_hex = `0x${'0'.repeat(64 - left.length)}${left}`
  const right_hex = `0x${'0'.repeat(64 - right.length)}${right}`

  const hash = mimc7.multiHash([left_hex, right_hex])
  const hex = mimc7.F.toString(hash, 16)
  const padded_hex = '0'.repeat(64 - hex.length) + hex

  return padded_hex
}

export interface IMerkleTree {
  root: () => string
  proof: (index: number) => {
    root: string
    pathElements: string[]
    pathIndices: number[]
    leaf: string
  }
  insert: (leaf: string) => void
}

export class MerkleTreeMiMC implements IMerkleTree {
  readonly zeroValue = '18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63' // sha256("simple_shield")
  levels: number
  hashLeftRight: (mimc7: MiMC, left: string, right: string) => string
  storage: Map<string, string>
  zeros: string[]
  totalLeaves: number
  mimc7: MiMC

  constructor(
    levels: number,
    mimc7: MiMC,
    defaultLeaves: string[] = [],
    hashLeftRight = MiMC7
  ) {
    this.levels = levels
    this.hashLeftRight = hashLeftRight
    this.storage = new Map()
    this.zeros = []
    this.totalLeaves = 0
    this.mimc7 = mimc7

    // build zeros depends on tree levels
    let currentZero = this.zeroValue
    this.zeros.push(currentZero)
    for (let i = 0; i < levels; i++) {
      currentZero = this.hashLeftRight(mimc7, currentZero, currentZero)
      this.zeros.push(currentZero)
    }

    if (defaultLeaves.length > 0) {
      this.totalLeaves = defaultLeaves.length

      // store leaves with key value pair
      let level = 0
      defaultLeaves.forEach((leaf, index) => {
        this.storage.set(MerkleTreeMiMC.indexToKey(level, index), leaf)
      })

      // build tree with initial leaves
      level++
      let numberOfNodesInLevel = Math.ceil(this.totalLeaves / 2)
      for (level; level <= this.levels; level++) {
        for (let i = 0; i < numberOfNodesInLevel; i++) {
          const leftKey = MerkleTreeMiMC.indexToKey(level - 1, 2 * i)
          const rightKey = MerkleTreeMiMC.indexToKey(level - 1, 2 * i + 1)

          const left = this.storage.get(leftKey)
          const right = this.storage.get(rightKey) || this.zeros[level - 1]
          if (!left) throw new Error('leftKey not found')

          const node = this.hashLeftRight(mimc7, left, right)
          this.storage.set(MerkleTreeMiMC.indexToKey(level, i), node)
        }
        numberOfNodesInLevel = Math.ceil(numberOfNodesInLevel / 2)
      }
    }
  }

  getZeros(): string[] {
    return this.zeros
  }

  static indexToKey(level: number, index: number): string {
    return `${level}-${index}`
  }

  getIndex(leaf: string): number {
    this.storage.forEach((value, key) => {
      if (value === leaf) {
        return Number(key.split('-')[1])
      }
    })
    return -1
  }

  root(): string {
    return (
      this.storage.get(MerkleTreeMiMC.indexToKey(this.levels, 0)) ||
      this.zeros[this.levels]
    )
  }

  proof(indexOfLeaf: number) {
    const pathElements: string[] = []
    const pathIndices: number[] = []

    const leaf = this.storage.get(MerkleTreeMiMC.indexToKey(0, indexOfLeaf))
    if (!leaf) throw new Error('leaf not found')

    // store sibling into pathElements and target's indices into pathIndices
    const handleIndex = (level: number, currentIndex: number, siblingIndex: number) => {
      const siblingValue =
        this.storage.get(MerkleTreeMiMC.indexToKey(level, siblingIndex)) ||
        this.zeros[level]
      pathElements.push(siblingValue)
      pathIndices.push(currentIndex % 2)
    }

    this.traverse(indexOfLeaf, handleIndex)

    return {
      root: this.root(),
      pathElements,
      pathIndices,
      leaf: leaf,
    }
  }

  insert(leaf: string) {
    const index = this.totalLeaves
    this.update(index, leaf, true)
    this.totalLeaves++
  }

  update(index: number, newLeaf: string, isInsert = false) {
    if (!isInsert && index >= this.totalLeaves) {
      throw Error('Use insert method for new elements.')
    }
    if (isInsert && index < this.totalLeaves) {
      throw Error('Use update method for existing elements.')
    }

    const keyValueToStore: { key: string; value: string }[] = []
    let currentElement: string = newLeaf

    const handleIndex = (level: number, currentIndex: number, siblingIndex: number) => {
      const siblingElement =
        this.storage.get(MerkleTreeMiMC.indexToKey(level, siblingIndex)) ||
        this.zeros[level]

      let left: string
      let right: string
      if (currentIndex % 2 === 0) {
        left = currentElement
        right = siblingElement
      } else {
        left = siblingElement
        right = currentElement
      }

      keyValueToStore.push({
        key: MerkleTreeMiMC.indexToKey(level, currentIndex),
        value: currentElement,
      })

      currentElement = this.hashLeftRight(this.mimc7, left, right)
    }

    this.traverse(index, handleIndex)

    // push root to the end
    keyValueToStore.push({
      key: MerkleTreeMiMC.indexToKey(this.levels, 0),
      value: currentElement,
    })

    for (const o of keyValueToStore) {
      this.storage.set(o.key, o.value)
    }
  }

  // traverse from leaf to root with handler for target node and sibling node
  private traverse(
    indexOfLeaf: number,
    handler: (level: number, currentIndex: number, siblingIndex: number) => void
  ) {
    let currentIndex = indexOfLeaf
    for (let i = 0; i < this.levels; i++) {
      let siblingIndex: number
      if (currentIndex % 2 === 0) {
        siblingIndex = currentIndex + 1
      } else {
        siblingIndex = currentIndex - 1
      }

      handler(i, currentIndex, siblingIndex)
      currentIndex = Math.floor(currentIndex / 2)
    }
  }
}

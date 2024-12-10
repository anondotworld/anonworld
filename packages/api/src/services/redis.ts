import { Redis } from 'ioredis'

export class RedisService {
  private readonly client: Redis
  private static instance: RedisService

  private constructor(url: string) {
    this.client = new Redis(url)
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      const url = process.env.REDIS_URL
      if (!url) {
        throw new Error('REDIS_URL environment variable is not set')
      }
      RedisService.instance = new RedisService(url)
    }
    return RedisService.instance
  }

  async getTrendingFeed(fid: number) {
    return this.client.get(`feed:trending:${fid}`)
  }

  async setTrendingFeed(fid: number, feed: string) {
    return this.client.set(`feed:trending:${fid}`, feed)
  }

  async getNewFeed(fid: number) {
    return this.client.get(`feed:new:${fid}`)
  }

  async setNewFeed(fid: number, feed: string) {
    return this.client.set(`feed:new:${fid}`, feed, 'EX', 30)
  }

  async getMerkleTree(key: string) {
    return this.client.get(key)
  }

  async setMerkleTree(key: string, tree: string, root: string) {
    await this.client.set(key, tree)
    await this.client.set(`${key}:root:${root}`, 'true', 'EX', 60 * 60)
  }

  async isValidMerkleTreeRoot(key: string, root: string) {
    return this.client.exists(`${key}:root:${root}`)
  }

  async getMerkleTreeForCredential(credentialId: string) {
    return this.client.get(`merkle-tree:credential:${credentialId}`)
  }

  async setMerkleTreeForCredential(credentialId: string, tree: string, root: string) {
    const key = `merkle-tree:credential:${credentialId}`
    await this.client.set(key, tree)
    await this.client.set(`${key}:root:${root}`, 'true', 'EX', 60 * 60)
  }

  async isValidMerkleTreeRootForCredential(credentialId: string, root: string) {
    return this.client.exists(`merkle-tree:credential:${credentialId}:root:${root}`)
  }

  async actionOccurred(actionId: string, hash: string) {
    return this.client.exists(`action:${actionId}:${hash}`)
  }

  async markActionOccurred(actionId: string, hash: string) {
    await this.client.set(`action:${actionId}:${hash}`, 'true', 'EX', 60 * 5)
  }
}

export const redis = RedisService.getInstance()

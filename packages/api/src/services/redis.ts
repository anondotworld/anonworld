import { Redis } from 'ioredis'
import { FarcasterCast } from '@anonworld/common'

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

  async getPost(hash: string) {
    return this.client.get(`post:${hash}`)
  }

  async setPost(hash: string, post: string) {
    return this.client.set(`post:${hash}`, post)
  }

  async setPosts(posts: FarcasterCast[]) {
    const args = posts.flatMap((post) => [`post:${post.hash}`, JSON.stringify(post)])
    return this.client.mset(args)
  }

  async getTrendingFeed(fid: number) {
    return this.client.get(`feed:trending:v2:${fid}`)
  }

  async setTrendingFeed(fid: number, feed: string) {
    return this.client.set(`feed:trending:v2:${fid}`, feed)
  }

  async getNewFeed(fid: number) {
    return this.client.get(`feed:new:v2:${fid}`)
  }

  async setNewFeed(fid: number, feed: string) {
    return this.client.set(`feed:new:v2:${fid}`, feed)
  }

  async actionOccurred(actionId: string, hash: string) {
    return this.client.exists(`action:${actionId}:${hash}`)
  }

  async markActionOccurred(actionId: string, hash: string) {
    await this.client.set(`action:${actionId}:${hash}`, 'true', 'EX', 60 * 5)
  }

  async getStorageSlot(chainId: number, address: string, key: string) {
    return this.client.get(`storage-slot:${chainId}:${address}:${key}`)
  }

  async setStorageSlot(chainId: number, address: string, key: string, value: string) {
    return this.client.set(`storage-slot:${chainId}:${address}:${key}`, value)
  }

  async getToken(chainId: number, tokenAddress: string) {
    return this.client.get(`token:${chainId}:${tokenAddress}`)
  }

  async setToken(chainId: number, tokenAddress: string, token: string) {
    return this.client.set(`token:${chainId}:${tokenAddress}`, token, 'EX', 60 * 60 * 24)
  }

  async getVaultChallenge(nonce: string): Promise<string | null> {
    return this.client.get(`vault:challenge:${nonce}`)
  }

  async setVaultChallenge(nonce: string, challenge: string) {
    return this.client.set(`vault:challenge:${nonce}`, challenge, 'EX', 60 * 5)
  }
}

export const redis = RedisService.getInstance()

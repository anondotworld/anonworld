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

  async actionOccurred(actionId: string, hash: string) {
    return this.client.exists(`action:${actionId}:${hash}`)
  }

  async markActionOccurred(actionId: string, hash: string) {
    await this.client.set(`action:${actionId}:${hash}`, 'true', 'EX', 60 * 5)
  }
}

export const redis = RedisService.getInstance()

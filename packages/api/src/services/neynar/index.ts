import {
  GetCastResponse,
  CreateCastResponse,
  GetBulkUsersResponse,
  GetCastsResponse,
  GetChannelResponse,
  GetUserByUsernameResponse,
  GetUsersResponse,
  GetBulkCastsResponse,
  GetConversationResponse,
} from './types'
import { getSignerForFid, PostDataV1 } from '@anonworld/db'

class NeynarService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.neynar.com/v2'
  private static instance: NeynarService

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  static getInstance(): NeynarService {
    if (!NeynarService.instance) {
      const apiKey = process.env.NEYNAR_API_KEY
      if (!apiKey) {
        throw new Error('NEYNAR_API_KEY environment variable is not set')
      }
      NeynarService.instance = new NeynarService(apiKey)
    }
    return NeynarService.instance
  }

  private async makeRequest<T>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'DELETE'
      maxRetries?: number
      retryDelay?: number
      body?: string
    }
  ): Promise<T> {
    const { maxRetries = 1, retryDelay = 10000, method, body } = options ?? {}
    let retries = 0

    while (retries < maxRetries) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': this.apiKey,
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        method,
        body,
      })

      if (response.status === 202 && maxRetries > 1) {
        retries++
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        continue
      }

      if (!response.ok) {
        console.error(await response.text())
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    }

    throw new Error('Maximum retries reached while waiting for data')
  }

  async getUserByUsername(username: string) {
    return this.makeRequest<GetUserByUsernameResponse>(
      `/farcaster/user/by_username?username=${username}`
    )
  }

  async getCast(hash: string) {
    return this.makeRequest<GetCastResponse>(
      `/farcaster/cast?type=${hash.startsWith('0x') ? 'hash' : 'url'}&identifier=${hash}`
    )
  }

  async getUser(fid: number) {
    return this.makeRequest<GetUsersResponse>(`/farcaster/user/bulk?fids=${fid}`)
  }

  async getBulkUsers(addresses: string[]) {
    return this.makeRequest<GetBulkUsersResponse>(
      `/farcaster/user/bulk-by-address?addresses=${addresses.join(',')}`
    )
  }

  async getUserCasts(fid: number, limit = 150, cursor?: string) {
    return this.makeRequest<GetCastsResponse>(
      `/farcaster/feed/user/casts?limit=${limit}&include_replies=true&fid=${fid}${cursor ? `&cursor=${cursor}` : ''}`
    )
  }

  async getBulkCasts(hashes: string[]) {
    return this.makeRequest<GetBulkCastsResponse>(
      `/farcaster/casts?casts=${hashes.join(',')}`
    )
  }

  async getChannel(identifier: string) {
    return this.makeRequest<GetChannelResponse>(
      `/farcaster/channel?id=${identifier}&type=id`
    )
  }

  async getCastFromURL(castURL: string) {
    const url = new URL(castURL)
    const isFarcaster =
      url.hostname === 'warpcast.com' &&
      (url.pathname.match(/^\/[^/]+\/0x[a-f0-9]+$/) || // /<username>/0x<hash>
        url.pathname.match(/^\/~\/conversations\/0x[a-f0-9]+$/)) // /~/conversations/0x<hash>
    if (isFarcaster) {
      const response = await this.getCast(castURL)
      if (response.cast) {
        return {
          hash: response.cast.hash,
          fid: response.cast.author.fid,
        }
      }
    }
  }

  async createCast(
    params: PostDataV1 & {
      fid: number
    }
  ) {
    const signerUuid = await getSignerForFid(params.fid)
    if (!signerUuid) {
      throw new Error('No signer found for address')
    }

    const embeds: Array<{
      url?: string
      castId?: { hash: string; fid: number }
    }> = []

    let reply: { hash: string; fid: number } | undefined
    if (params.reply) {
      reply = await this.getCastFromURL(params.reply)
      if (!reply) {
        embeds.unshift({
          url: params.reply,
        })
      }
    }

    for (const image of params.images) {
      embeds.unshift({
        url: image,
      })
    }

    let text = params.text ?? ''
    for (const link of params.links) {
      if (embeds.length >= 2) {
        if (text.length > 0) {
          text += `\n\n${link}`
        } else {
          text = link
        }
        continue
      }

      const maybeCast = await this.getCastFromURL(link)
      if (maybeCast) {
        embeds.unshift({
          castId: maybeCast,
        })
      } else {
        embeds.unshift({
          url: link,
        })
      }
    }

    const body = {
      signer_uuid: signerUuid.signer_uuid,
      parent: reply?.hash,
      parent_author_fid: reply?.fid,
      text,
      embeds: embeds.length > 0 ? embeds : undefined,
    }

    return await this.makeRequest<CreateCastResponse>('/farcaster/cast', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async deleteCast(params: {
    fid: number
    hash: string
  }) {
    const signer = await getSignerForFid(params.fid)
    if (!signer) {
      throw new Error('No signer found for address')
    }

    const cast = await this.getCast(params.hash)
    if (!cast.cast) {
      return {
        success: true,
      }
    }

    await this.makeRequest('/farcaster/cast', {
      method: 'DELETE',
      body: JSON.stringify({
        signer_uuid: signer.signer_uuid,
        target_hash: params.hash,
      }),
    })

    return {
      success: true,
    }
  }

  async getConversation(identifier: string) {
    return this.makeRequest<GetConversationResponse>(
      `/farcaster/cast/conversation?identifier=${identifier}&type=hash&reply_depth=5&include_chronological_parent_casts=false&sort_type=desc_chron&limit=50`
    )
  }
}

export const neynar = NeynarService.getInstance()

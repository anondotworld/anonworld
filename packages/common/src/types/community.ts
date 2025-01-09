import { FarcasterUser } from './farcaster'
import { Token } from './token'
import { TwitterUser } from './twitter'

export type Community = {
  id: string
  name: string
  description: string
  image_url: string
  fid: number
  twitter_username: string
  posts: number
  followers: number
  passkey_id: string
  wallet_id?: string
  wallet_address: string
  token: Token
  farcaster: FarcasterUser
  twitter?: TwitterUser
  created_at: string
}

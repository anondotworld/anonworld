import { CredentialWithId } from './credentials'

export type Vault = {
  id: string
  created_at: string
  posts: number
  credentials: Array<CredentialWithId>
}

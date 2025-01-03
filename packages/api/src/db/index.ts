import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { PostsRepository } from './repositories/posts'
import { VaultsRepository } from './repositories/vaults'
import { CredentialsRepository } from './repositories/credentials'
import { CommunitiesRepository } from './repositories/communities'
import { PasskeysRepository } from './repositories/passkeys'
import { SocialsRepository } from './repositories/socials'
import { TokensRepository } from './repositories/tokens'
import { RelationshipsRepository } from './repositories/relationships'
import { ActionsRepository } from './repositories/actions'

export class Repositories {
  public posts: PostsRepository
  public vaults: VaultsRepository
  public credentials: CredentialsRepository
  public communities: CommunitiesRepository
  public passkeys: PasskeysRepository
  public socials: SocialsRepository
  public tokens: TokensRepository
  public relationships: RelationshipsRepository
  public actions: ActionsRepository

  constructor() {
    const db = drizzle(process.env.DATABASE_URL as string)
    this.posts = new PostsRepository(db)
    this.vaults = new VaultsRepository(db)
    this.credentials = new CredentialsRepository(db)
    this.communities = new CommunitiesRepository(db)
    this.passkeys = new PasskeysRepository(db)
    this.socials = new SocialsRepository(db)
    this.tokens = new TokensRepository(db)
    this.relationships = new RelationshipsRepository(db)
    this.actions = new ActionsRepository(db)
  }
}

export const db = new Repositories()

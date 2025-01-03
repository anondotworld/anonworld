import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { PostsRepository } from './posts'
import { VaultsRepository } from './vaults'
import { CredentialsRepository } from './credentials'
import { CommunitiesRepository } from './communities'
import { PasskeysRepository } from './passkeys'
import { SocialsRepository } from './socials'
import { TokensRepository } from './tokens'
import { RelationshipsRepository } from './relationships'
import { ActionsRepository } from './actions'

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

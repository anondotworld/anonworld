import {
  TokenBalanceMetadata,
  CredentialProof,
  CredentialType,
  PostData,
} from '@anonworld/common'
import {
  communitiesTable,
  actionsTable,
  credentialsTable,
  postCredentialsTable,
  postRelationshipsTable,
  postsTable,
  tokensTable,
  vaultsTable,
  farcasterAccountsTable,
  twitterAccountsTable,
  postLikesTable,
  actionExecutionsTable,
  passkeysTable,
} from './schema'

export type DBAction = typeof actionsTable.$inferSelect
export type DBFarcasterAccount = typeof farcasterAccountsTable.$inferSelect
export type DBTwitterAccount = typeof twitterAccountsTable.$inferSelect
export type DBPost = typeof postsTable.$inferSelect & {
  data: PostData
}
export type DBPostLike = typeof postLikesTable.$inferSelect
export type DBPostRelationship = typeof postRelationshipsTable.$inferSelect
export type DBPostCredential = typeof postCredentialsTable.$inferSelect
export type DBActionExecution = typeof actionExecutionsTable.$inferSelect
export type DBCredential = typeof credentialsTable.$inferSelect & {
  proof: CredentialProof
  metadata: TokenBalanceMetadata
  type: CredentialType
}
export type DBCommunity = typeof communitiesTable.$inferSelect
export type DBToken = typeof tokensTable.$inferSelect
export type DBVault = typeof vaultsTable.$inferSelect
export type DBPasskey = typeof passkeysTable.$inferSelect & {
  public_key: {
    prefix: number
    x: bigint
    y: bigint
  }
}

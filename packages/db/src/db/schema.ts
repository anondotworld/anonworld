import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  integer,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const accountsTable = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  chain_id: integer('chain_id').notNull(),
  token_address: varchar({ length: 255 }).notNull(),
  creator_address: varchar({ length: 255 }).notNull(),
  fid: integer('fid')
    .references(() => farcasterAccountsTable.fid)
    .notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const actionsTable = pgTable('actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  account_id: uuid('account_id')
    .references(() => accountsTable.id)
    .notNull(),
  type: varchar({ length: 255 }).notNull(),
  threshold: varchar({ length: 255 }).notNull(),
  credential_id: varchar({ length: 255 })
    .references(() => credentialsTable.id)
    .notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const farcasterAccountsTable = pgTable('farcaster_accounts', {
  fid: integer('fid').primaryKey(),
  signer_uuid: varchar({ length: 255 }).notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const postsTable = pgTable('posts', {
  hash: varchar({ length: 255 }).primaryKey(),
  fid: integer('fid')
    .references(() => farcasterAccountsTable.fid)
    .notNull(),
  data: jsonb('data').notNull(),
  reveal_hash: varchar({ length: 255 }),
  reveal_metadata: jsonb('reveal_metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),
})

export const postRelationshipsTable = pgTable(
  'post_relationships',
  {
    post_hash: varchar({ length: 255 })
      .references(() => postsTable.hash)
      .notNull(),
    target: varchar({ length: 255 }).notNull(),
    target_account: varchar({ length: 255 }).notNull(),
    target_id: varchar({ length: 255 }).notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
    deleted_at: timestamp(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.post_hash, table.target, table.target_account] }),
  })
)

export const postCredentialsTable = pgTable('post_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  post_hash: varchar({ length: 255 })
    .references(() => postsTable.hash)
    .notNull(),
  credential_id: varchar({ length: 255 })
    .references(() => credentialsTable.id)
    .notNull(),
})

export const actionExecutionsTable = pgTable('action_executions', {
  id: uuid('id').defaultRandom().primaryKey(),
  account_id: uuid('account_id')
    .references(() => accountsTable.id)
    .notNull(),
  action_id: uuid('action_id')
    .references(() => actionsTable.id)
    .notNull(),
  action_data: jsonb('action_data').notNull(),
  status: varchar({ length: 255 }).notNull(),
  error: jsonb('error'),
  response: jsonb('response'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const credentialsTable = pgTable('credentials', {
  id: varchar({ length: 255 }).primaryKey(),
  type: varchar({ length: 255 }).notNull(),
  metadata: jsonb('metadata').notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const merkleRootsTable = pgTable('merkle_roots', {
  root: varchar({ length: 255 }).primaryKey(),
  credential_id: varchar({ length: 255 })
    .references(() => credentialsTable.id)
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

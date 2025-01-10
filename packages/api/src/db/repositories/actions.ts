import { drizzle } from 'drizzle-orm/node-postgres'
import {
  actionExecutionsTable,
  actionsTable,
  communitiesTable,
  tokensTable,
} from '../schema'
import { and, eq, inArray } from 'drizzle-orm'
import { DBAction, DBCommunity, DBToken } from '../types'

export class ActionsRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async get(id: string) {
    const [action] = await this.db
      .select()
      .from(actionsTable)
      .where(eq(actionsTable.id, id))
      .limit(1)

    return action as DBAction
  }

  async getByCommunityAndType(communityId: string, type: string) {
    const [action] = await this.db
      .select()
      .from(actionsTable)
      .where(and(eq(actionsTable.community_id, communityId), eq(actionsTable.type, type)))
      .limit(1)

    return action as DBAction
  }

  async getBulk(ids: string[]) {
    const response = await this.db
      .select()
      .from(actionsTable)
      .where(inArray(actionsTable.id, ids))
    return response as DBAction[]
  }

  async list(showHidden = false) {
    const actions = await this.db
      .select()
      .from(actionsTable)
      .leftJoin(communitiesTable, eq(actionsTable.community_id, communitiesTable.id))
      .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
      .where(showHidden ? undefined : eq(actionsTable.hidden, false))

    const response = actions.map((action) => ({
      ...action.actions,
      community: {
        ...action.communities,
        token: action.tokens,
      },
    }))

    return response as (DBAction & { community: DBCommunity & { token: DBToken } })[]
  }

  async logExecution(params: typeof actionExecutionsTable.$inferInsert) {
    await this.db.insert(actionExecutionsTable).values(params)
  }

  async update(id: string, params: Partial<typeof actionsTable.$inferInsert>) {
    await this.db.update(actionsTable).set(params).where(eq(actionsTable.id, id))
  }

  async create(params: typeof actionsTable.$inferInsert) {
    await this.db.insert(actionsTable).values(params)
  }

  async delete(id: string) {
    await this.db.delete(actionsTable).where(eq(actionsTable.id, id))
  }
}

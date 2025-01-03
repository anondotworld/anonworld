import { drizzle } from 'drizzle-orm/node-postgres'
import {
  actionExecutionsTable,
  actionsTable,
  communitiesTable,
  tokensTable,
} from '../db/schema'
import { eq, inArray } from 'drizzle-orm'
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

  async getBulk(ids: string[]) {
    const response = await this.db
      .select()
      .from(actionsTable)
      .where(inArray(actionsTable.id, ids))
    return response as DBAction[]
  }

  async list() {
    const actions = await this.db
      .select()
      .from(actionsTable)
      .leftJoin(communitiesTable, eq(actionsTable.community_id, communitiesTable.id))
      .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
      .where(eq(actionsTable.hidden, false))

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
}

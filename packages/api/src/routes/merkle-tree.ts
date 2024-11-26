import { createElysia } from '../utils'
import { t } from 'elysia'
import { buildHoldersTree, getTree, setTree } from '@anon/utils/src/merkle-tree'
import { ProofType } from '@anon/utils/src/proofs/generate'
import { TOKEN_CONFIG } from '@anon/utils/src/config'

export const merkleTreeRoutes = createElysia({ prefix: '/merkle-tree' }).post(
  '/',
  async ({ body }) => {
    const cachedTree = await getTree(body.tokenAddress, body.proofType)
    if (cachedTree) {
      return cachedTree
    }

    const config = TOKEN_CONFIG[body.tokenAddress]

    let minAmount = config.postAmount
    if (body.proofType === ProofType.DELETE_POST) {
      minAmount = config.deleteAmount
    } else if (body.proofType === ProofType.PROMOTE_POST) {
      minAmount = config.promoteAmount
    }

    const tree = await buildHoldersTree({
      tokenAddress: body.tokenAddress,
      minAmount,
    })

    await setTree(body.tokenAddress, body.proofType, tree)

    return tree
  },
  {
    body: t.Object({
      tokenAddress: t.String(),
      proofType: t.Enum(ProofType),
    }),
  }
)

import { ActionType, Community } from '../../../types'
import { useActions } from '../../../hooks/use-actions'
import { useSDK } from '../../../providers'
import { getUsableCredential } from '../../../utils'
import { NewPostProvider } from '../../posts/new/context'
import { NewPostDialog } from '../../posts/new/dialog'
import { NewPostButton } from '../../posts/new'
import { NewCredential } from '../../credentials'
import { useToken } from '../../../hooks'
import { formatUnits } from 'viem'

export function NewPost({ onSuccess }: { onSuccess: (hash: string) => void }) {
  return (
    <NewPostProvider onSuccess={onSuccess}>
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

export function NewCommunityPost({
  onSuccess,
  community,
}: {
  onSuccess: (hash: string) => void
  community: Community
}) {
  const { data: actions } = useActions()
  const { credentials } = useSDK()
  const { data } = useToken({
    chainId: community.chain_id,
    address: community.token_address,
  })

  const relevantAction = actions?.find((action) => {
    if (
      action.type === ActionType.COPY_POST_FARCASTER &&
      action.metadata.fid === community.fid
    ) {
      return action
    }

    return null
  })

  const credential = relevantAction
    ? getUsableCredential(credentials.credentials, relevantAction)
    : null

  if (!actions) return null

  if (!credential) {
    const minimumBalance = Math.min(
      ...actions
        .map((action) => action.credential_requirement?.minimumBalance)
        .filter((b) => b !== undefined)
        .map((b) =>
          Number.parseFloat(
            formatUnits(BigInt(b), data?.attributes.implementations[0].decimals ?? 18)
          )
        )
    )

    return (
      <NewCredential
        initialTokenId={{
          chainId: community.chain_id,
          address: community.token_address,
        }}
        initialBalance={minimumBalance}
      />
    )
  }

  return (
    <NewPostProvider
      onSuccess={onSuccess}
      initialCredentials={credential ? [credential] : undefined}
    >
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

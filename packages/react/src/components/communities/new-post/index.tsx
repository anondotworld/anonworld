import {
  ActionType,
  Community,
  CredentialType,
  ERC20CredentialRequirement,
  ERC721CredentialRequirement,
} from '@anonworld/common'
import { useActions } from '../../../hooks/use-actions'
import { useCredentials } from '../../../providers'
import { getUsableCredential } from '@anonworld/common'
import { NewPostProvider } from '../../posts/new/context'
import { NewPostDialog } from '../../posts/new/dialog'
import { NewPostButton } from '../../posts/new'
import { NewCredential } from '../../credentials'
import { formatUnits } from 'viem'

export function NewPost() {
  return (
    <NewPostProvider>
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

export function NewCommunityPost({
  community,
}: {
  community: Community
}) {
  const { data: actions } = useActions()
  const { credentials } = useCredentials()
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
    ? getUsableCredential(credentials, relevantAction)
    : null

  if (!actions) return null

  if (!credential) {
    let minimumBalance: number | undefined = undefined
    for (const action of actions) {
      const credentialType = action.credential_id?.split(':')[0] as
        | CredentialType
        | undefined

      if (
        !action.community ||
        action.community.id !== community.id ||
        !action.credential_requirement ||
        !credentialType
      )
        continue

      switch (credentialType) {
        case CredentialType.ERC20_BALANCE:
        case CredentialType.ERC721_BALANCE: {
          const credentialRequirement = action.credential_requirement as
            | ERC20CredentialRequirement
            | ERC721CredentialRequirement
            | undefined

          if (!credentialRequirement) {
            continue
          }

          const balance = credentialRequirement.minimumBalance
          const value = Number.parseFloat(
            formatUnits(BigInt(balance), community.token.decimals)
          )
          if (!minimumBalance || value < minimumBalance) {
            minimumBalance = value
          }
          break
        }
        default:
          continue
      }
    }

    return (
      <NewCredential
        initialTokenId={{
          chainId: community.token.chain_id,
          address: community.token.address,
        }}
        initialBalance={minimumBalance ?? 0}
      />
    )
  }

  return (
    <NewPostProvider initialCredentials={credential ? [credential] : undefined}>
      <NewPostDialog>
        <NewPostButton />
      </NewPostDialog>
    </NewPostProvider>
  )
}

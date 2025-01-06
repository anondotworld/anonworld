import { Community } from './community'
import { Credential, CredentialRequirement } from './credentials'

export type ActionRequest = {
  data: any
  credentials: Credential[]
  actionId: string
}

export enum ActionType {
  CREATE_POST = 'CREATE_POST',
  COPY_POST_TWITTER = 'COPY_POST_TWITTER',
  COPY_POST_FARCASTER = 'COPY_POST_FARCASTER',
  DELETE_POST_TWITTER = 'DELETE_POST_TWITTER',
  DELETE_POST_FARCASTER = 'DELETE_POST_FARCASTER',
}

type BaseAction = {
  id: string
  created_at: Date
  updated_at: Date
  credential_id: string | null
  credential_requirement: CredentialRequirement | null
  trigger: string
  community: Community | null
}

type ActionTargetPost = {
  post: {
    text: {
      eq?: string[]
      ne?: string[]
    }
  }
}

export type Action =
  | (BaseAction & {
      type: ActionType.COPY_POST_TWITTER
      metadata: {
        twitter: string
        target: ActionTargetPost
      }
    })
  | (BaseAction & {
      type: ActionType.DELETE_POST_TWITTER
      metadata: {
        twitter: string
      }
    })
  | (BaseAction & {
      type: ActionType.COPY_POST_FARCASTER
      metadata: {
        fid: number
        target: ActionTargetPost
      }
    })
  | (BaseAction & {
      type: ActionType.DELETE_POST_FARCASTER
      metadata: {
        fid: number
      }
    })
  | (BaseAction & {
      type: ActionType.CREATE_POST
      metadata: {
        target: ActionTargetPost
      }
    })

export type CreatePostActionData = {
  text: string | null
  reply: string | null
  links: string[]
  images: string[]
  revealHash?: string
  copyActionIds?: string[]
}

export type DeletePostFarcasterActionData = {
  hash: string
}

export type DeletePostTwitterActionData = {
  tweetId: string
}

export type CopyPostFarcasterActionData = {
  hash: string
}

export type CopyPostTwitterActionData = {
  hash: string
  reply?: boolean
}

export type ExecuteActionData =
  | CreatePostActionData
  | DeletePostFarcasterActionData
  | DeletePostTwitterActionData
  | CopyPostFarcasterActionData
  | CopyPostTwitterActionData

export type ExecuteAction = {
  credentials: string[]
  actionId: string
  data: ExecuteActionData
}

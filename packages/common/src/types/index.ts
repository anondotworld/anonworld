export * from './actions'
export * from './community'
export * from './credentials'
export * from './farcaster'
export * from './post'
export * from './swap'
export * from './token'
export * from './twitter'
export * from './vaults'
export * from './zerion'

export type ApiResponse<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: {
        message: string
        status: number
      }
    }

export type RequestConfig = {
  authenticated?: boolean
  headers?: Record<string, string>
  isFormData?: boolean
} & Omit<RequestInit, 'headers'>

export type UploadImageResponse = {
  success: boolean
  status: number
  data?: {
    link: string
  }
  error?: string
}

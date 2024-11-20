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
} & Omit<RequestInit, 'headers'>

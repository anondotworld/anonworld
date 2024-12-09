import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AnonWorldSDK } from '@anonworld/sdk'

export const sdk = new AnonWorldSDK(process.env.NEXT_PUBLIC_API_URL)

export const DELETE_ACTION_ID = 'd4890070-d70f-4bfe-9c37-863ab9608205'
export const PROMOTE_ACTION_ID = '083ca1d2-b661-4465-b025-3dd8a18532f6'
export const LAUNCH_ACTION_ID = 'ab637e2e-2ab1-4708-90a9-942b2505fe15'
export const CREATE_ACTION_ID = 'e6138573-7b2f-43ab-b248-252cdf5eaeee'

export const TICKER = 'ANON'
export const TOKEN_ADDRESS = '0x0db510e79909666d6dec7f5e49370838c16d950f'
export const POST_AMOUNT = '5000000000000000000000'
export const LAUNCH_AMOUNT = '2000000000000000000000000'
export const PROMOTE_AMOUNT = '2000000000000000000000000'
export const DELETE_AMOUNT = '2000000000000000000000000'
export const FARC_USERNAME = 'anoncast'
export const FID = 883287
export const BEST_OF_FID = 880094
export const LAUNCH_FID = 883713

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

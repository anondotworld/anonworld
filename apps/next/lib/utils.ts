import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

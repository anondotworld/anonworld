import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const CREATE_POST_ACTION_ID = '2bee80b6-9a4c-4faa-9c42-55dfcfb4b651'
export const DELETE_FROM_ANONCAST_ACTION_ID = 'd0469704-135a-45bc-b550-6507704a7414'
export const COPY_TO_ANONCAST_ACTION_ID = 'da7f3e1b-cfaf-4954-9025-d56490dfb0a3'
export const DELETE_FROM_TWITTER_ACTION_ID = 'd660aef6-5a6b-491e-8437-ab6f58bdddcb'
export const COPY_TO_TWITTER_ACTION_ID = '6ef8ce32-9322-4550-b9ff-45a27317500a'
export const COPY_TO_ANONFUN_ACTION_ID = '86a595ac-c4b7-41ff-98f0-7fb9d0bf0d67'

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

export function timeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count}${interval.label} ago`
    }
  }

  return 'just now'
}

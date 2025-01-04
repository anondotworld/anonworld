import { Action, CredentialWithId } from '@anonworld/common'

export const CREDENTIAL_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7 // 7 days

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

export function formatAmount(num: number): string {
  if (num < 1000) return num.toString()
  const units = ['K', 'M', 'B', 'T']
  const unitIndex = Math.floor(Math.log10(num) / 3) - 1
  const unitValue = 1000 ** (unitIndex + 1)
  const formattedNumber = (num / unitValue).toFixed(1)
  return `${formattedNumber}${units[unitIndex]}`
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getUsableCredential(credentials: CredentialWithId[], action: Action) {
  if (
    !action.credential_id ||
    credentials.length === 0 ||
    !action.credential_requirement?.minimumBalance
  ) {
    return
  }

  const potentialCredentials = credentials
    .filter((credential) => credential.credential_id === action.credential_id)
    .sort((a, b) => {
      const aBalance = BigInt(a.metadata.balance)
      const bBalance = BigInt(b.metadata.balance)
      if (aBalance === bBalance) {
        return 0
      }
      return aBalance < bBalance ? -1 : 1
    })

  for (const credential of potentialCredentials) {
    if (
      BigInt(credential.metadata.balance) >=
      BigInt(action.credential_requirement.minimumBalance)
    ) {
      return credential
    }
  }
}

export function formatHexId(hex: string) {
  let str = ''
  for (let i = 2; i < hex.length - 1; i += 2) {
    const num = Number.parseInt(hex.slice(i, i + 2), 16)
    if (!Number.isNaN(num)) {
      // Ensure we only get values 0-61
      const code = Math.abs(num) % 62
      // 0-9: 48-57 in ASCII
      // A-Z: 65-90 in ASCII
      // a-z: 97-122 in ASCII
      if (code < 10) {
        str += String.fromCharCode(48 + code) // 0-9
      } else if (code < 36) {
        str += String.fromCharCode(65 + (code - 10)) // A-Z
      } else {
        str += String.fromCharCode(97 + (code - 36)) // a-z
      }
    }
  }
  return str.slice(0, 8)
}

export function toHslColors(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return {
    background: `hsl(${hue}, 70%, 85%)`,
    secondary: `hsl(${hue}, 70%, 50%)`,
    color: `hsl(${hue}, 70%, 15%)`,
  }
}

export function encodeJson(obj: any): string {
  if (Array.isArray(obj)) {
    return '[' + obj.map(encodeJson).join(',') + ']'
  }

  if (typeof obj === 'object' && obj !== null) {
    return (
      '{' +
      Object.keys(obj)
        .sort()
        .map((key) => `"${key}":${encodeJson(obj[key])}`)
        .join(',') +
      '}'
    )
  }

  return JSON.stringify(obj)
}

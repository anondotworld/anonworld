export const ANON_ADDRESS = '0x0db510e79909666d6dec7f5e49370838c16d950f'
export const COMMENT_ADDRESS = '0x0000000000000000000000000000000000000000'

export const TOKEN_CONFIG: Record<
  string,
  {
    ticker: string
    postAmount: string
    promoteAmount: string
    deleteAmount: string
    farcasterUsername: string
    fid: number
  }
> = {
  [ANON_ADDRESS]: {
    ticker: 'ANON',
    postAmount: '30000000000000000000000',
    promoteAmount: '1000000000000000000000000',
    deleteAmount: '3000000000000000000000000',
    farcasterUsername: 'anoncast',
    fid: 880094,
  },
  [COMMENT_ADDRESS]: {
    ticker: 'COMMENT',
    postAmount: '1',
    promoteAmount: '1',
    deleteAmount: '1',
    farcasterUsername: 'comment',
    fid: 880094,
  },
}

export const USERNAME_TO_ADDRESS: Record<string, string> = Object.entries(
  TOKEN_CONFIG
).reduce(
  (acc, [address, { farcasterUsername }]) => {
    acc[farcasterUsername] = address
    return acc
  },
  {} as Record<string, string>
)

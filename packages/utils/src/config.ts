export const ANON_ADDRESS = '0x0db510e79909666d6dec7f5e49370838c16d950f'
export const COMMENT_ADDRESS = '0x0000000000000000000000000000000000000000'

export const TOKEN_CONFIG: Record<
  string,
  {
    ticker: string
    postAmount: string
    launchAmount: string
    promoteAmount: string
    deleteAmount: string
    farcasterUsername: string
    fid: number
    bestOfFid: number
    launchFid: number
  }
> = {
  [ANON_ADDRESS]: {
    ticker: 'ANON',
    postAmount: '5000000000000000000000',
    launchAmount: '2000000000000000000000000',
    promoteAmount: '2000000000000000000000000',
    deleteAmount: '2000000000000000000000000',
    farcasterUsername: 'anoncast',
    fid: 883287,
    bestOfFid: 880094,
    launchFid: 883713,
  },
  [COMMENT_ADDRESS]: {
    ticker: 'COMMENT',
    postAmount: '1',
    launchAmount: '1',
    promoteAmount: '1',
    deleteAmount: '1',
    farcasterUsername: 'comment',
    fid: 883287,
    bestOfFid: 880094,
    launchFid: 883713,
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

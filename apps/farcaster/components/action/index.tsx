import { useBalance } from '@/lib/hooks/use-balance'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { CircleCheckIcon, ExternalLink } from 'lucide-react'
import { CircleXIcon } from 'lucide-react'
import { CircleMinusIcon } from 'lucide-react'
import { CreatePost } from '../create-post'
import { POST_AMOUNT, PROMOTE_AMOUNT, DELETE_AMOUNT } from '@/lib/utils'
import { useAccount } from 'wagmi'
import { Separator } from '../ui/separator'

export default function ActionComponent({
  variant = 'post',
  title,
  description,
  requirements,
}: {
  variant?: 'post' | 'launch'
  title?: string
  description?: string
  requirements?: Array<{ amount: number; label: string }>
}) {
  const { address } = useAccount()
  const { data, isLoading } = useBalance()

  const BALANCE = data ? data / BigInt(10 ** 18) : BigInt(0)
  const FARCASTER_POST = BigInt(POST_AMOUNT) / BigInt(10 ** 18)
  const TWITTER_PROMOTE = BigInt(PROMOTE_AMOUNT) / BigInt(10 ** 18)
  const DELETE_POST = BigInt(DELETE_AMOUNT) / BigInt(10 ** 18)

  // Default values for post variant
  const defaultTitle = 'Post anonymously to Farcaster'
  const defaultDescription =
    "Posts are made anonymous using zk proofs. Due to the complex calculations required, it could take up to a few minutes. Do not post porn, doxes, shills, or threats. This is not about censorship resistance - it's about great anonymous posts."
  const defaultRequirements = [
    { amount: Number(FARCASTER_POST), label: 'Post to @rawanon' },
    {
      amount: Number(TWITTER_PROMOTE),
      label: 'Promote posts to @anoncast and X/Twitter',
    },
    { amount: Number(DELETE_POST), label: 'Delete posts' },
  ]

  const displayTitle = title || defaultTitle
  const displayDescription = description || defaultDescription
  const displayRequirements = requirements || defaultRequirements

  return (
    <Alert className="flex flex-col gap-4 bg-zinc-900 border border-zinc-700">
      <AlertTitle className="font-semibold text-xl">{displayTitle}</AlertTitle>
      <AlertDescription>
        <p className="text-zinc-400">{displayDescription}</p>
        <br />
        <p className="text-zinc-400">Holder requirements:</p>
        <ul className="flex flex-col gap-1 mt-3">
          {displayRequirements.map((req, index) => (
            <TokenRequirement
              key={index}
              tokenAmount={data}
              tokenNeeded={BigInt(req.amount)}
              string={req.label}
              isConnected={!!address && !isLoading}
            />
          ))}
        </ul>
      </AlertDescription>
      {!address && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-row items-center justify-between gap-2">
          <p className="font-bold">{'You are not fully signed in. Sign in to post.'}</p>
        </div>
      )}
      {address && !isLoading ? (
        FARCASTER_POST > BALANCE ? (
          <a
            href={`https://app.uniswap.org/swap?exactAmount=5000&exactField=output&inputCurrency=ETH&outputCurrency=0x0db510e79909666d6dec7f5e49370838c16d950f&chain=base`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-row items-center justify-between gap-2">
              <p className="font-bold flex flex-row items-center gap-2">
                {`You need 5000 $ANON to post. Click here to buy.`}
                <ExternalLink size={16} />
              </p>
            </div>
          </a>
        ) : (
          <>
            <Separator />
            <CreatePost variant={variant} />
          </>
        )
      ) : (
        <></>
      )}
    </Alert>
  )
}

function TokenRequirement({
  tokenAmount,
  tokenNeeded,
  oldTokenNeeded,
  string,
  isConnected,
}: {
  tokenAmount: bigint | undefined
  tokenNeeded: bigint
  oldTokenNeeded?: bigint
  string: string
  isConnected: boolean
}) {
  const tokenAmountInTokens = tokenAmount ? tokenAmount / BigInt(10 ** 18) : BigInt(0)

  return (
    <li className="flex flex-row items-center gap-2 font-medium text-xs sm:text-base">
      {isConnected ? (
        tokenAmountInTokens >= tokenNeeded ? (
          <CircleCheckIcon className="text-green-500 w-4 h-4" />
        ) : (
          <CircleXIcon className="text-red-500 w-4 h-4" />
        )
      ) : (
        <CircleMinusIcon className="text-gray-400 w-4 h-4" />
      )}
      <p>
        {!!oldTokenNeeded && (
          <>
            <span className="line-through text-zinc-500">{`${oldTokenNeeded.toLocaleString()}`}</span>
            <span>{'  '}</span>
          </>
        )}
        {`${tokenNeeded.toLocaleString()} $ANON: ${string}`}
      </p>
    </li>
  )
}

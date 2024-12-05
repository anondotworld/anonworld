'use client'

import { Cast, Reveal } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Heart, Loader2, MessageSquare, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { useCreatePost } from '../create-post/context'
import { useAccount, useSignMessage } from 'wagmi'
import { Checkbox } from '../ui/checkbox'
import { useBalance } from '@/hooks/use-balance'
import { DELETE_AMOUNT, PROMOTE_AMOUNT, LAUNCH_AMOUNT, LAUNCH_FID } from '@/lib/utils'
import { usePromotePost } from '@/hooks/use-promote-post'
import { useDeletePost } from '@/hooks/use-delete-post'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { hashMessage } from 'viem'
import { Input } from '../ui/input'
import { useQuery } from '@tanstack/react-query'
import { useLaunchPost } from '@/hooks/use-launch-post'

function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  const units = ['K', 'M', 'B', 'T']
  const unitIndex = Math.floor(Math.log10(num) / 3) - 1
  const unitValue = 1000 ** (unitIndex + 1)
  const formattedNumber = (num / unitValue).toFixed(1)
  return `${formattedNumber}${units[unitIndex]}`
}

export function Post({
  cast,
}: {
  cast: Cast
}) {
  const { variant } = useCreatePost()
  const { address } = useAccount()
  const { data: balance } = useBalance()
  const [reveal, setReveal] = useState(cast.reveal)

  const canDelete =
    address && !!balance && balance >= BigInt(DELETE_AMOUNT) && cast.tweetId

  const unableToPromoteRegex = [
    /.*clanker.*launch.*/i,
    /.*dexscreener.com.*/i,
    /.*dextools.io.*/i,
    /.*0x[a-fA-F0-9]{40}.*/i,
  ]

  const canPromote =
    address &&
    !!balance &&
    balance >= BigInt(PROMOTE_AMOUNT) &&
    !cast.tweetId &&
    variant === 'anoncast' &&
    !unableToPromoteRegex.some((regex) => cast.text.match(regex))

  const canLaunch =
    cast.author.fid !== LAUNCH_FID &&
    address &&
    !!balance &&
    balance >= BigInt(LAUNCH_AMOUNT) &&
    !cast.launchHash &&
    ((variant === 'anonfun' &&
      cast.hash !== '0x5c790f70ffe770c68248775af6f2c1fcfb29de58') ||
      cast.text.match(/.*clanker.*launch.*/))

  const canReveal = address && !!cast.reveal && !cast.reveal.revealedAt

  const { setParent, setQuote } = useCreatePost()
  const cleanText = (text: string) => {
    if (!text) return ''

    // Split text into characters and only normalize those that look suspicious
    return text
      .split('')
      .map((char) => {
        // Check if char is in a problematic Unicode range or looks unusual
        if (!/^[\x20-\x7E]$/.test(char)) {
          // Only normalize suspicious characters
          return char.normalize('NFKC')
        }
        return char
      })
      .join('')
  }

  const reply = () => {
    setParent(cast)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const quote = () => {
    setQuote(cast)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Usage in component
  const sanitizedText = cleanText(cast.text)

  return (
    <div className="relative [overflow-wrap:anywhere] bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
      <div className="flex flex-row gap-4  p-4 sm:p-6  ">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 sm:flex-row justify-between">
            <div className="flex flex-row items-center">
              <div className="flex flex-row items-center gap-2 ">
                <div className="text-sm font-medium text-zinc-400">
                  {timeAgo(cast.timestamp)}
                </div>
                {cast.parent_hash && (
                  <>
                    <div className="w-1 h-1 bg-zinc-400" />
                    <a
                      href={`https://warpcast.com/~/conversations/${cast.parent_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-zinc-400 flex flex-row items-center gap-2 underline decoration-dotted hover:text-zinc-300"
                    >
                      replying to a post
                    </a>
                  </>
                )}
              </div>
            </div>
            <div
              className=" flex flex-row gap-3 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={`https://warpcast.com/~/conversations/${cast.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                <img src="/farcaster.svg" alt="Warpcast" className="w-4 h-4 invert" />
              </a>
              {cast.tweetId && (
                <a
                  href={`https://x.com/i/status/${cast.tweetId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/x.svg" alt="Warpcast" className="w-4 h-4 invert" />
                </a>
              )}
            </div>
          </div>
          {reveal?.revealedAt && <RevealBadge reveal={reveal} />}
          <div className="font-medium whitespace-pre-wrap">{sanitizedText}</div>
          {cast.embeds.map((embed) => {
            if (embed.metadata?.image) {
              return (
                <img key={embed.url} src={embed.url} alt="embed" className="rounded-xl" />
              )
            }
            if (embed.metadata?.html) {
              return (
                <div key={embed.url} className="w-full border rounded-xl overflow-hidden">
                  {embed.metadata?.html?.ogImage &&
                    embed.metadata?.html?.ogImage.length > 0 && (
                      <img
                        src={embed.metadata?.html?.ogImage?.[0]?.url}
                        alt={embed.metadata?.html?.ogImage?.[0]?.alt}
                        className="object-cover aspect-video"
                      />
                    )}
                  <div className="p-2">
                    <h3 className="text-lg font-bold">{embed.metadata?.html?.ogTitle}</h3>
                    <p className="text-sm text-zinc-400">
                      {embed.metadata?.html?.ogDescription}
                    </p>
                  </div>
                </div>
              )
            }

            if (embed.cast) {
              return (
                <div
                  key={embed.cast.hash}
                  className="flex flex-row gap-4 border border-zinc-700 p-4 rounded-xl"
                >
                  <img
                    src={embed.cast.author?.pfp_url}
                    className="w-10 h-10 rounded-full"
                    alt="pfp"
                  />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-row items-center gap-2">
                      <div className="text-md font-bold">
                        {embed.cast.author?.username}
                      </div>
                      <div className="text-sm font-semibold">
                        {timeAgo(embed.cast.timestamp)}
                      </div>
                    </div>
                    <div className="text-md">{embed.cast.text}</div>
                  </div>
                </div>
              )
            }

            return <div key={embed.url}>{embed.url}</div>
          })}
          <div className="flex flex-col gap-4 sm:flex-row justify-between">
            <div className="flex flex-row items-center gap-2 mt-2">
              <div className="flex flex-row items-center gap-1.5 ">
                <MessageSquare size={16} className="text-zinc-400" />
                <p className="text-sm font-medium">{formatNumber(cast.replies.count)}</p>
              </div>
              <div className="flex flex-row items-center gap-1.5 ">
                <RefreshCcw size={16} className="text-zinc-400" />
                <p className="text-sm font-medium ">
                  {formatNumber(cast.reactions.recasts_count)}
                </p>
              </div>
              <div className="flex flex-row items-center gap-1.5 w-16">
                <Heart size={16} className="text-zinc-400" />
                <p className="text-sm font-medium">
                  {formatNumber(cast.reactions.likes_count)}
                </p>
              </div>
            </div>

            <div
              className=" flex flex-row gap-3 items-center"
              onClick={(e) => e.preventDefault()}
            >
              {address && (
                <p
                  className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400"
                  onClick={quote}
                >
                  Quote
                </p>
              )}
              {address && (
                <p
                  className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400"
                  onClick={reply}
                >
                  Reply
                </p>
              )}
              {canReveal && <RevealButton cast={cast} onReveal={setReveal} />}
              {canPromote && <PromoteButton cast={cast} />}
              {canLaunch && <LaunchButton cast={cast} />}
              {cast.launchHash && (
                <a
                  href={`https://warpcast.com/~/conversations/${cast.launchHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400"
                >
                  Launched
                </a>
              )}
              {canDelete && <DeleteButton cast={cast} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function timeAgo(timestamp: string): string {
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

function DeleteButton({ cast }: { cast: Cast }) {
  const { toast } = useToast()
  const { deletePost, deleteState } = useDeletePost()
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    await deletePost(cast.hash)
    toast({
      title: 'Post will be deleted in 1-2 minutes',
    })
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm text-red-500 underline decoration-dotted font-semibold cursor-pointer hover:text-red-400">
          Delete
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteState.status !== 'idle'}
          >
            {deleteState.status === 'generating' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : deleteState.status === 'signature' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Awaiting signature</p>
              </div>
            ) : (
              'Delete'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function PromoteButton({ cast }: { cast: Cast }) {
  const { toast } = useToast()
  const { promotePost, promoteState } = usePromotePost()
  const [open, setOpen] = useState(false)
  const [asReply, setAsReply] = useState(false)

  const handlePromote = async () => {
    await promotePost(cast.hash, asReply)
    toast({
      title: 'Post will be promoted in 1-2 minutes',
    })
    setOpen(false)
  }

  const twitterEmbed = cast.embeds?.find(
    (e) => e.url?.includes('x.com') || e.url?.includes('twitter.com')
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400">
          Promote
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote to X/Twitter?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to delete the post if you want to remove it from X/Twitter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {twitterEmbed && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="as-reply"
              checked={asReply}
              onCheckedChange={(checked) => setAsReply(checked as boolean)}
            />
            <label
              htmlFor="as-reply"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Promote as reply
            </label>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handlePromote} disabled={promoteState.status !== 'idle'}>
            {promoteState.status === 'generating' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : promoteState.status === 'signature' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Awaiting signature</p>
              </div>
            ) : (
              'Promote'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function LaunchButton({ cast }: { cast: Cast }) {
  const { toast } = useToast()
  const { launchPost, launchState } = useLaunchPost()
  const [open, setOpen] = useState(false)

  const handleLaunch = async () => {
    await launchPost(cast.hash)
    toast({
      title: 'Post will be launched in 1-2 minutes',
    })
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm text-green-500 underline decoration-dotted font-semibold cursor-pointer hover:text-green-400">
          Launch
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Launch token</AlertDialogTitle>
          <AlertDialogDescription>
            This will launch the token to @anonfun via @clanker.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleLaunch} disabled={launchState.status !== 'idle'}>
            {launchState.status === 'generating' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : launchState.status === 'signature' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Awaiting signature</p>
              </div>
            ) : (
              'Launch'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RevealButton({
  cast,
  onReveal,
}: { cast: Cast; onReveal: (reveal: Reveal) => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [value, setValue] = useState('')
  const [isRevealing, setIsRevealing] = useState(false)
  const { signMessageAsync } = useSignMessage()
  const { address } = useAccount()
  const router = useRouter()

  const handleReveal = async () => {
    if (!cast.reveal || !address) return
    setIsRevealing(true)
    try {
      const inputHash = hashMessage(JSON.stringify(cast.reveal.input) + value)
      if (inputHash !== cast.reveal.revealHash) {
        toast({
          title: 'Incorrect phrase',
        })
      } else {
        const message = JSON.stringify({
          revealHash: cast.reveal.revealHash,
          revealPhrase: value,
        })
        const signature = await signMessageAsync({
          message,
        })
        await api.revealPost(cast.hash, message, value, signature, address)
        onReveal({
          ...cast.reveal,
          revealPhrase: value,
          signature,
          address,
          revealedAt: new Date().toISOString(),
        })
        router.push(`/posts/${cast.hash}`)
      }
    } catch {
      setIsRevealing(false)
      return
    }
    setIsRevealing(false)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400">
          Reveal
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reveal your post</AlertDialogTitle>
          <AlertDialogDescription>
            Claim this post by revealing the phrase you chose when you created it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="Enter phrase"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleReveal} disabled={isRevealing}>
            {isRevealing ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Revealing</p>
              </div>
            ) : (
              <p>Reveal</p>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RevealBadge({ reveal }: { reveal: Reveal }) {
  const { data } = useQuery({
    queryKey: ['identity', reveal.address],
    queryFn: () => api.getIdentity(reveal.address),
  })

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex flex-row items-center w-full">
      {data?.username && (
        <a
          href={`https://warpcast.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold cursor-pointer hover:text-zinc-400 flex flex-row items-center gap-1 text-green-400 hover:text-green-200"
        >
          <span>{`revealed as `}</span>
          <img src={data.pfp_url} className="w-4 h-4 rounded-full" alt="pfp" />
          <span>{data.username}</span>
          <span>{` ${timeAgo(reveal.revealedAt)}`}</span>
        </a>
      )}
      {!data?.username && (
        <a
          href={`https://basescan.org/address/${reveal.address}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-sm font-semibold cursor-pointer hover:text-zinc-400 text-green-400 hover:text-green-200">
            {`revealed as ${formatAddress(reveal.address)} ${timeAgo(reveal.revealedAt)}`}
          </span>
        </a>
      )}
    </div>
  )
}

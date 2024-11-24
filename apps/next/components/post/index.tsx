'use client'

import { Cast } from '@/lib/types'
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
import { Heart, Loader2, MessageSquare, RefreshCcw, Reply } from 'lucide-react'
import { useState } from 'react'
import { useCreatePost } from '../create-post/context'
import { useAccount } from 'wagmi'
import { Checkbox } from '../ui/checkbox'
import { useBalance } from '@/hooks/use-balance'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { usePromotePost } from '@/hooks/use-promote-post'
import { useDeletePost } from '@/hooks/use-delete-post'

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
  tokenAddress,
}: {
  cast: Cast
  tokenAddress: string
}) {
  const { address } = useAccount()
  const { data: balance } = useBalance(tokenAddress)

  const canDelete =
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].deleteAmount) &&
    cast.tweetId

  const canPromote =
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].promoteAmount) &&
    !cast.tweetId

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
              onKeyDown={(e) => e.stopPropagation()}
            >
              <a
                href={`https://warpcast.com/~/casts/${cast.hash}`}
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
              onKeyDown={(e) => e.preventDefault()}
            >
              {address && (
                <p
                  className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400"
                  onClick={quote}
                  onKeyDown={quote}
                >
                  Quote
                </p>
              )}
              {address && (
                <p
                  className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-zinc-400"
                  onClick={reply}
                  onKeyDown={reply}
                >
                  Reply
                </p>
              )}
              {canPromote && <PromoteButton cast={cast} tokenAddress={tokenAddress} />}
              {canDelete && <DeleteButton cast={cast} tokenAddress={tokenAddress} />}
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

function DeleteButton({ cast, tokenAddress }: { cast: Cast; tokenAddress: string }) {
  const { toast } = useToast()
  const { deletePost, deleteState } = useDeletePost(tokenAddress)
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
          Delete on X
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

function PromoteButton({ cast, tokenAddress }: { cast: Cast; tokenAddress: string }) {
  const { toast } = useToast()
  const { promotePost, promoteState } = usePromotePost(tokenAddress)
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
        <p className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-red-400">
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

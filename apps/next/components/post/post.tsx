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
import { Heart, Loader2, MessageSquare, RefreshCcw } from 'lucide-react'
import { useAccount, useSignMessage } from 'wagmi'
import { api } from '@/lib/api'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { hashMessage } from 'viem'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { usePost } from './context'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export function Post({
  cast,
  canDelete,
  canPromote,
}: { cast: Cast; canDelete: boolean; canPromote: boolean }) {
  const promotable = canPromote && !cast.tweetId
  const deletable =
    canDelete && Date.now() - new Date(cast.timestamp).getTime() <= 3 * 60 * 60 * 1000
  const revealable = !!cast.reveal && !cast.reveal.revealedAt
  const actionable = revealable || promotable || deletable

  return (
    <div className="relative [overflow-wrap:anywhere] bg-[#111111] rounded-xl overflow-hidden">
      <Link href={`/posts/${cast.hash}`}>
        <div className="flex flex-row gap-4 border p-4 sm:p-6 rounded-xl">
          <div className="flex flex-col gap-2 w-full">
            {cast.reveal && <RevealBadge reveal={cast.reveal} />}
            <div className="font-medium">{cast.text}</div>
            {cast.embeds.map((embed) => {
              if (embed.metadata?.image) {
                return (
                  <img
                    key={embed.url}
                    src={embed.url}
                    alt="embed"
                    className="rounded-xl"
                  />
                )
              }
              if (embed.metadata?.html) {
                return (
                  <div
                    key={embed.url}
                    className="w-full border rounded-xl overflow-hidden"
                  >
                    {embed.metadata?.html?.ogImage &&
                      embed.metadata?.html?.ogImage.length > 0 && (
                        <img
                          src={embed.metadata?.html?.ogImage?.[0]?.url}
                          alt={embed.metadata?.html?.ogImage?.[0]?.alt}
                          className="object-cover aspect-video"
                        />
                      )}
                    <div className="p-2">
                      <h3 className="text-lg font-bold">
                        {embed.metadata?.html?.ogTitle}
                      </h3>
                      <p className="text-sm text-gray-400">
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
                    className="flex flex-row gap-4 border p-4 rounded-xl"
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
                <div className="text-sm font-medium text-gray-400">
                  {timeAgo(cast.timestamp)}
                </div>
                <div className="w-1 h-1 bg-gray-400" />

                <div className="flex flex-row items-center gap-1 ">
                  <MessageSquare size={16} className="text-gray-400" />
                  <p className="text-sm font-medium">{cast.replies.count}</p>
                </div>
                <div className="flex flex-row items-center gap-1 ">
                  <RefreshCcw size={16} className="text-gray-400" />
                  <p className="text-sm font-medium ">{cast.reactions.recasts_count}</p>
                </div>
                <div className="flex flex-row items-center gap-1 w-16">
                  <Heart size={16} className="text-gray-400" />
                  <p className="text-sm font-medium">{cast.reactions.likes_count}</p>
                </div>
              </div>

              <div
                className=" flex flex-row gap-3 items-center"
                onClick={(e) => e.preventDefault()}
                onKeyDown={(e) => e.preventDefault()}
              >
                {cast.hash && (
                  <p
                    className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-red-400"
                    onClick={() =>
                      window.open(
                        `https://warpcast.com/${cast.author.username}/${cast.hash.slice(
                          0,
                          10
                        )}`,
                        '_blank'
                      )
                    }
                    onKeyDown={(e) =>
                      window.open(
                        `https://warpcast.com/${cast.author.username}/${cast.hash.slice(
                          0,
                          10
                        )}`,
                        '_blank'
                      )
                    }
                  >
                    Warpcast
                  </p>
                )}
                {cast.tweetId && (
                  <p
                    className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-red-400"
                    onClick={() =>
                      window.open(`https://x.com/i/status/${cast.tweetId}`, '_blank')
                    }
                    onKeyDown={() =>
                      window.open(`https://x.com/i/status/${cast.tweetId}`, '_blank')
                    }
                  >
                    Twitter
                  </p>
                )}
                {actionable && <ul>&#8226;</ul>}
                {revealable && <RevealButton cast={cast} />}
                {promotable && <PromoteButton cast={cast} />}
                {deletable && <DeleteButton cast={cast} />}
              </div>
            </div>
          </div>
        </div>
      </Link>
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
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { deletePost, deleteState } = usePost()

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
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { promotePost, promoteState } = usePost()
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

function RevealButton({ cast }: { cast: Cast }) {
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
        router.push(`/posts/${cast.hash}`)
      }
    } catch (e) {
      setIsRevealing(false)
      return
    }
    setIsRevealing(false)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <p className="text-sm underline decoration-dotted font-semibold cursor-pointer hover:text-red-400">
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
          id="parent"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter phrase"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleReveal} disabled={isRevealing}>
            {isRevealing ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
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
    <div className="text-sm font-semibold bg-green-900/50 text-green-300 border-green-700/50 border rounded-full px-3 py-1 w-fit backdrop-blur-sm flex flex-row items-center">
      <span className="text-green-300 text-[10px] font-bold uppercase border-r border-green-300/50 pr-2">
        Revealed
      </span>
      {data?.username && (
        <a
          href={`https://warpcast.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-green-200 font-semibold pl-2 text-sm flex flex-row items-center gap-1"
        >
          <span>{`${timeAgo(reveal.revealedAt)} by `}</span>
          <img src={data.pfp_url} className="w-4 h-4 rounded-full" alt="pfp" />
          <span>{data.username}</span>
        </a>
      )}
      {!data?.username && (
        <span className="text-green-200 font-semibold pl-2 text-sm">
          {`${timeAgo(reveal.revealedAt)} by ${formatAddress(reveal.address)}`}
        </span>
      )}
    </div>
  )
}

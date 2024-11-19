import { Cast, GetCastsResponse } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
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
import { useBalance } from '@/hooks/use-balance'
import { TOKEN_CONFIG } from '@anon/api/lib/config'
import { PostProvider, usePost } from './context'
import { useToast } from '@/hooks/use-toast'
import { Heart, Loader2, MessageSquare, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { useSignMessage } from 'wagmi'
import { ToastAction } from '../ui/toast'

export default function PostFeed({
  tokenAddress,
  userAddress,
}: { tokenAddress: string; userAddress?: string }) {
  const [selected, setSelected] = useState<'new' | 'trending'>('trending')
  const { data: balance } = useBalance(tokenAddress, userAddress)
  const { signMessageAsync } = useSignMessage()

  const { data: trendingPosts } = useQuery({
    queryKey: ['trending', tokenAddress],
    queryFn: async (): Promise<GetCastsResponse> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${tokenAddress}/trending`
      )
      return await response.json()
    },
  })

  const { data: newPosts } = useQuery({
    queryKey: ['posts', tokenAddress],
    queryFn: async (): Promise<GetCastsResponse> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${tokenAddress}`
      )
      return await response.json()
    },
  })

  const getSignature = async ({
    address,
    timestamp,
  }: { address: string; timestamp: number }) => {
    try {
      const message = `${address}:${timestamp}`
      const signature = await signMessageAsync({
        message,
      })
      return { signature, message }
    } catch {
      return
    }
  }

  const canDelete =
    !!userAddress &&
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].deleteAmount)

  const canPromote =
    !!userAddress &&
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].promoteAmount)

  return (
    <PostProvider
      tokenAddress={tokenAddress}
      userAddress={userAddress}
      getSignature={getSignature}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          {trendingPosts && (
            <div
              className={`text-xl font-bold cursor-pointer ${
                selected !== 'trending' ? 'text-gray-500' : ''
              }`}
              onClick={() => setSelected('trending')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelected('trending')
                }
              }}
            >
              Trending
            </div>
          )}
          {newPosts && (
            <div
              className={`text-xl font-bold cursor-pointer ${
                selected !== 'new' ? 'text-gray-500' : ''
              }`}
              onClick={() => setSelected('new')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelected('new')
                }
              }}
            >
              New
            </div>
          )}
        </div>
        {selected === 'new' ? (
          <Posts canDelete={canDelete} canPromote={canPromote} data={newPosts} />
        ) : (
          <Posts canDelete={canDelete} canPromote={canPromote} data={trendingPosts} />
        )}
      </div>
    </PostProvider>
  )
}

function Posts({
  data,
  canDelete,
  canPromote,
}: { canDelete: boolean; canPromote: boolean; data: GetCastsResponse | undefined }) {
  return (
    <div className="flex flex-col gap-4">
      {data?.casts.map((cast) => (
        <Post key={cast.hash} cast={cast} canDelete={canDelete} canPromote={canPromote} />
      ))}
    </div>
  )
}

export function Post({
  cast,
  canDelete,
  canPromote,
}: { cast: Cast; canDelete: boolean; canPromote: boolean }) {
  return (
    <div className="relative">
      <a
        href={`https://warpcast.com/~/conversations/${cast.hash}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="flex flex-row gap-4 border p-4 rounded-xl">
          <img src={cast.author.pfp_url} className="w-10 h-10 rounded-full" alt="pfp" />
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-row items-center gap-2">
              <div className="text-md font-bold">{cast.author.username}</div>
              <div className="text-sm font-semibold">{timeAgo(cast.timestamp)}</div>
            </div>
            <div className="text-md">{cast.text}</div>
            {cast.embeds.map((embed) => {
              if (embed.metadata?.image) {
                return <img key={embed.url} src={embed.url} alt="embed" />
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
                      <p className="text-sm text-gray-600">
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
                      src={embed.cast.author.pfp_url}
                      className="w-10 h-10 rounded-full"
                      alt="pfp"
                    />
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex flex-row items-center gap-2">
                        <div className="text-md font-bold">
                          {embed.cast.author.username}
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
            <div className="flex flex-row items-center gap-2 mt-2">
              <div className="flex flex-row items-center gap-2 w-16">
                <MessageSquare size={16} />
                <p className="text-sm font-semibold">{cast.replies.count}</p>
              </div>
              <div className="flex flex-row items-center gap-2 w-16">
                <RefreshCcw size={16} />
                <p className="text-sm font-semibold">{cast.reactions.recasts_count}</p>
              </div>
              <div className="flex flex-row items-center gap-2 w-16">
                <Heart size={16} />
                <p className="text-sm font-semibold">{cast.reactions.likes_count}</p>
              </div>
            </div>
          </div>
        </div>
      </a>
      <div className="absolute top-2 right-2 flex flex-row gap-2">
        {canDelete && <DeleteButton cast={cast} />}
        {canPromote && <PromoteButton cast={cast} />}
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
  const { deletePost, deleteState } = usePost()
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    await deletePost(cast.hash)
    toast({
      title: 'Post deleted',
    })
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="font-semibold">
          Delete
        </Button>
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
            {deleteState.status === 'deleting' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Deleting</p>
              </div>
            ) : deleteState.status === 'generating' ? (
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
  const { promotePost, promoteState } = usePost()
  const [open, setOpen] = useState(false)

  const handlePromote = async () => {
    const tweetId = await promotePost(cast.hash)
    if (tweetId) {
      toast({
        title: 'Post promoted',
        action: (
          <ToastAction
            altText="View on X"
            onClick={() => {
              window.open(`https://twitter.com/twitter/status/${tweetId}`, '_blank')
            }}
          >
            View on X
          </ToastAction>
        ),
      })
    }
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="font-semibold">
          Promote
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote to X/Twitter?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to delete the post if you want to remove it from X/Twitter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handlePromote} disabled={promoteState.status !== 'idle'}>
            {promoteState.status === 'promoting' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Promoting</p>
              </div>
            ) : promoteState.status === 'generating' ? (
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

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
import { DeletePostProvider, useDeletePost } from './context'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSignMessage } from 'wagmi'

export default function PostFeed({
  tokenAddress,
  userAddress,
}: { tokenAddress: string; userAddress?: string }) {
  const { data } = useQuery({
    queryKey: ['posts', tokenAddress],
    queryFn: async (): Promise<GetCastsResponse> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${tokenAddress}`
      )
      return await response.json()
    },
  })

  const { data: balance } = useBalance(tokenAddress, userAddress)
  const { signMessageAsync } = useSignMessage()

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

  return (
    <DeletePostProvider
      tokenAddress={tokenAddress}
      userAddress={userAddress}
      getSignature={getSignature}
    >
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold">Posts</div>
        {data?.casts.map((cast) => (
          <Post key={cast.hash} cast={cast} canDelete={canDelete} />
        ))}
      </div>
    </DeletePostProvider>
  )
}

export function Post({ cast, canDelete }: { cast: Cast; canDelete: boolean }) {
  return (
    <div className="flex flex-row gap-4 border p-4 rounded-xl relative">
      <img src={cast.author.pfp_url} className="w-10 h-10 rounded-full" alt="pfp" />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row items-center gap-2">
          <div className="text-sm font-bold">{cast.author.username}</div>
          <div className="text-sm">{timeAgo(cast.timestamp)}</div>
        </div>
        <div className="text-sm ">{cast.text}</div>
        {cast.embeds.map((embed) => {
          if (embed.metadata?.image) {
            return <img key={embed.url} src={embed.url} alt="embed" />
          }
          if (embed.metadata?.html) {
            return (
              <div key={embed.url} className="w-full border rounded-xl overflow-hidden">
                {embed.metadata?.html.ogImage && embed.metadata.html.ogImage.length > 0 && (
                  <img
                    src={embed.metadata.html.ogImage[0].url}
                    alt={embed.metadata.html.ogImage[0].alt}
                    className="object-cover aspect-video"
                  />
                )}
                <div className="p-2">
                  <h3 className="text-lg font-bold">{embed.metadata?.html.ogTitle}</h3>
                  <p className="text-sm text-gray-600">
                    {embed.metadata?.html.ogDescription}
                  </p>
                </div>
              </div>
            )
          }
          return (
            <div key={embed.url} className="w-full border rounded-xl overflow-hidden px-3 py-2">
              <span className="text-sm text-gray-600">{embed.url}</span>
            </div>
          )
        })}
      </div>
      {canDelete && (
        <div className="absolute top-2 right-2">
          <DeleteButton cast={cast} />
        </div>
      )}
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
  const { deletePost, state } = useDeletePost()
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
        <Button variant="destructive">Delete</Button>
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
            disabled={state.status !== 'idle'}
          >
            {state.status === 'deleting' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Deleting</p>
              </div>
            ) : state.status === 'generating' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : state.status === 'signature' ? (
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

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { CreatePostProvider, useCreatePost } from './context'
import { Image, Link, Loader2, Quote, Reply, X, Slash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { ReactNode, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

import { Input } from '../ui/input'
import { useQuery } from '@tanstack/react-query'
import { useBalance } from '@/hooks/use-balance'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { formatUnits } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import Confetti from 'confetti-react'

const MAX_EMBEDS = 2

export function CreatePost({
  tokenAddress,
  userAddress,
  onSuccess,
  getSignature,
}: {
  tokenAddress: string
  userAddress: string
  onSuccess?: () => void
  getSignature: ({
    address,
    timestamp,
  }: { address: string; timestamp: number }) => Promise<
    | {
        signature: string
        message: string
      }
    | undefined
  >
}) {
  const { data } = useBalance(tokenAddress, userAddress)

  if (data === undefined) return null

  const postAmount = TOKEN_CONFIG[tokenAddress].postAmount
  const difference = BigInt(postAmount) - data

  if (difference > 0)
    return (
      <a
        href={`https://app.uniswap.org/swap?outputCurrency=${tokenAddress}&chain=base`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-row items-center justify-between gap-2">
          <p className="font-bold">{`Not enough tokens to post. Buy ${formatUnits(
            difference,
            18
          )} more.`}</p>
        </div>
      </a>
    )

  return (
    <CreatePostProvider
      tokenAddress={tokenAddress}
      userAddress={userAddress}
      onSuccess={onSuccess}
      getSignature={getSignature}
    >
      <CreatePostForm />
    </CreatePostProvider>
  )
}

function CreatePostForm() {
  const { text, setText, createPost, state } = useCreatePost()
  const { toast } = useToast()
  const [confetti, setConfetti] = useState(false)

  const length = new Blob([text ?? '']).size

  const handleSetText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (new Blob([e.target.value]).size > 320) return
    setText(e.target.value)
  }

  const handleCreatePost = async () => {
    await createPost()
    toast({
      title: 'Post will be created in 1-2 minutes',
    })
    setConfetti(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <RemoveableParent />
      <Textarea
        value={text ?? ''}
        onChange={handleSetText}
        className="h-32 resize-none"
        placeholder="What's happening?"
      />
      <RemoveableImage />
      <RemoveableEmbed />
      <RemoveableQuote />
      <div className="flex justify-between">
        <div className="flex gap-4">
          <UploadImage />
          <EmbedLink />
          <ParentCast />
          <QuoteCast />
          <Channel />
        </div>
        <div className="flex flex-row items-center gap-2">
          <p>{`${length} / 320`}</p>
          <Button
            onClick={handleCreatePost}
            className="font-bold text-md rounded-xl hover:scale-105 transition-all duration-300"
            disabled={!['idle', 'success', 'error'].includes(state.status)}
          >
            {state.status === 'generating' ? (
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
              'Post'
            )}
          </Button>
        </div>
      </div>
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={[
            '#808080', // Mid gray
            '#999999',
            '#b3b3b3',
            '#cccccc',
            '#e6e6e6',
            '#ffffff', // Pure white
          ]}
          drawShape={(ctx) => {
            ctx.beginPath()
            ctx.lineWidth = 3

            // Draw the main curve of the question mark
            ctx.moveTo(0, -8)
            ctx.quadraticCurveTo(8, -8, 8, -16)
            ctx.quadraticCurveTo(8, -30, 0, -30)
            ctx.quadraticCurveTo(-8, -30, -8, -20)

            // Draw the dot of the question mark
            ctx.moveTo(2, 0)
            ctx.arc(0, 0, 2, 0, Math.PI * 2, true)

            ctx.stroke()
            ctx.closePath()
          }}
          gravity={0.25}
          recycle={false}
          onConfettiComplete={() => setConfetti(false)}
        />
      )}
    </div>
  )
}

function TooltipButton({
  children,
  tooltip,
  onClick,
  disabled,
}: {
  children: ReactNode
  tooltip: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onClick} disabled={disabled}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function UploadImage() {
  const { setImage, embedCount, image } = useCreatePost()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const newFiles: { file: string; type: string }[] = []
    const fileReadPromises = Array.from(files).map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newFiles.push({
              file: (e.target.result as string).split(',')[1],
              type: file.type,
            })
          }
          resolve()
        }
        reader.readAsDataURL(file)
      })
    })

    await Promise.all(fileReadPromises)

    if (newFiles.length === 0) {
      setLoading(false)
      return
    }

    const response = await fetch('https://imgur-apiv3.p.rapidapi.com/3/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Client-ID c2593243d3ea679',
        'X-RapidApi-Key': 'H6XlGK0RRnmshCkkElumAWvWjiBLp1ItTOBjsncst1BaYKMS8H',
      },
      body: JSON.stringify({ image: newFiles[0].file }),
    })

    const data: { data: { link: string } } = await response.json()

    if (!data.data.link) {
      setLoading(false)
      return
    }

    setImage(data.data.link)
    setLoading(false)
  }

  return (
    <TooltipButton
      tooltip="Upload image"
      onClick={() => fileInputRef.current?.click()}
      disabled={loading || !!image || embedCount >= MAX_EMBEDS}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />
      {loading && <Loader2 className="animate-spin" />}
      {!loading && <Image />}
    </TooltipButton>
  )
}

function RemoveableImage() {
  const { image, setImage } = useCreatePost()
  if (!image) return null
  return (
    <div className="relative">
      <img src={image} alt="Uploaded" />
      <Button
        variant="outline"
        size="icon"
        onClick={() => setImage(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

function EmbedLink() {
  const { setEmbed, embedCount, embed } = useCreatePost()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const handleEmbed = () => {
    if (value) {
      setEmbed(value)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton
          tooltip="Embed link"
          disabled={!!embed || embedCount >= MAX_EMBEDS}
        >
          <Link />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed link</DialogTitle>
          <DialogDescription>You can embed any website.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="link"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleEmbed}>Embed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveableEmbed() {
  const { embed, setEmbed } = useCreatePost()
  const { data: opengraph } = useQuery({
    queryKey: ['opengraph', embed],
    queryFn: embed
      ? async () => {
          const response = await fetch(`/api/opengraph?url=${embed}`)
          const data = await response.json()
          return data
        }
      : undefined,
    enabled: !!embed,
  })

  if (!embed || !opengraph) return null

  const image =
    opengraph?.ogImage?.[0]?.url ?? opengraph.twitterImage?.[0]?.url ?? opengraph.favicon
  const title = opengraph.ogTitle ?? opengraph.twitterTitle ?? opengraph.dcTitle
  const description =
    opengraph.ogDescription ??
    opengraph.twitterDescription?.[0] ??
    opengraph.dcDescription

  return (
    <div className="relative">
      <div className="w-full border rounded-xl overflow-hidden">
        {image && (
          <img
            src={image}
            alt={opengraph.dcTitle}
            className="object-cover aspect-video"
          />
        )}
        <div className="p-2">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setEmbed(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

function ParentCast() {
  const { setParent, parent } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetParent = async () => {
    setLoading(true)
    if (value) {
      const data = await api.getCast(value)
      setParent(data ?? null)
    }
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton tooltip="Reply to post" disabled={!!parent}>
          <Reply />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to post</DialogTitle>
          <DialogDescription>
            You can only reply to posts from Warpcast.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="parent"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://warpcast.com/..."
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSetParent} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveableParent() {
  const { parent, setParent } = useCreatePost()
  if (!parent) return null

  return (
    <div className="relative">
      <div
        className="w-full border rounded-xl p-2 overflow-hidden cursor-pointer flex flex-col gap-2"
        onClick={() =>
          window.open(
            `https://warpcast.com/${parent.author.username}/${parent.hash}`,
            '_blank'
          )
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            window.open(
              `https://warpcast.com/${parent.author.username}/${parent.hash}`,
              '_blank'
            )
          }
        }}
      >
        <p className="text-sm text-gray-600">Replying to</p>
        {parent.author && (
          <div className="flex items-center gap-2">
            <img
              src={parent.author.pfp_url}
              alt={parent.author.username}
              className="w-6 h-6 rounded-full"
            />
            <p className="text-md font-bold">{parent.author.username}</p>
          </div>
        )}
        <p className="text-md line-clamp-2">{parent.text}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setParent(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

function Channel() {
  const { setChannel, channel } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(channel?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetChannel = async () => {
    if (!value) {
      // clearing the channel
      setChannel(null)
      setOpen(false)
      return
    }

    setLoading(true)
    setError(null) // Clear any previous error
    try {
    const data = await api.getChannel(value.replace('/', ''))
    if (!data) {
      setError('Couldn\'t find that channel.')
    } else {
      setChannel(data)
      setOpen(false)
      }
    } catch (e) {
      console.error(e)
      setError(`Something went wrong.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton tooltip="Channel">
          {channel ? (
            <img src={channel.image_url} alt={channel.name} className='rounded-sm' />
          ) : (
            <Slash />
          )}
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Channel</DialogTitle>
          <DialogDescription>
            You can set a channel for your post.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            id="channel"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="memes"
          />
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSetChannel} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuoteCast() {
  const { setQuote, embedCount, quote, setEmbed } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetQuote = async () => {
    setLoading(true)
    if (value) {
      if (value.includes('x.com') || value.includes('twitter.com')) {
        setEmbed(value)
      } else {
        const data = await api.getCast(value)
        setQuote(data ?? null)
      }
    }
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton
          tooltip="Quote post"
          disabled={!!quote || embedCount >= MAX_EMBEDS}
        >
          <Quote />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quote post</DialogTitle>
          <DialogDescription>
            You can quote posts from Warpcast or X/Twitter.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="quote"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://warpcast.com/..., https://x.com/..."
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSetQuote} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveableQuote() {
  const { quote, setQuote } = useCreatePost()
  if (!quote) return null

  return (
    <div className="relative">
      <div
        className="w-full border rounded-xl p-2 overflow-hidden cursor-pointer flex flex-col gap-2"
        onClick={() =>
          window.open(
            `https://warpcast.com/${quote.author.username}/${quote.hash}`,
            '_blank'
          )
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            window.open(
              `https://warpcast.com/${quote.author.username}/${quote.hash}`,
              '_blank'
            )
          }
        }}
      >
        <p className="text-sm text-gray-600">Quoting</p>
        <div className="flex items-center gap-2">
          <img
            src={quote.author.pfp_url}
            alt={quote.author.username}
            className="w-6 h-6 rounded-full"
          />
          <p className="text-md font-bold">{quote.author.username}</p>
        </div>
        <p className="text-md line-clamp-2">{quote.text}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setQuote(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

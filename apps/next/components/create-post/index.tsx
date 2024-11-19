import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { CreatePostProvider, useCreatePost } from './context'
import { ExternalLink, Image, Link, Loader2, Quote, Reply, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { ReactNode, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { useQuery } from '@tanstack/react-query'
import { GetCastResponse } from '@/lib/types'
import { useBalance } from '@/hooks/use-balance'
import { TOKEN_CONFIG } from '@anon/api/lib/config'
import { formatUnits } from 'viem'

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

  const length = new Blob([text ?? '']).size

  const handleSetText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (new Blob([e.target.value]).size > 320) return
    setText(e.target.value)
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
        </div>
        <div className="flex flex-row items-center gap-2">
          <p>{`${length} / 320`}</p>
          <Button
            onClick={createPost}
            className="font-bold text-md rounded-xl hover:scale-105 transition-all duration-300"
            disabled={!['idle', 'success', 'error'].includes(state.status)}
          >
            {state.status === 'posting' ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Posting</p>
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
              'Post'
            )}
          </Button>
        </div>
      </div>
      {state.status === 'success' && (
        <a
          href={`https://warpcast.com/~/conversations/${state.post.cast.hash}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex flex-row items-center justify-between gap-2">
            <p className="font-bold">Posted!</p>
            <div className="flex flex-row items-center gap-2">
              <p>View on Warpcast</p>
              <ExternalLink size={16} />
            </div>
          </div>
        </a>
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
      disabled={loading || !!image || embedCount >= 2}
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
        <TooltipButton tooltip="Embed link" disabled={!!embed || embedCount >= 2}>
          <Link />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed link</DialogTitle>
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-cast?identifier=${value}`
      )
      const data: GetCastResponse = await response.json()
      setParent(data ?? null)
    }
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton tooltip="Reply to cast" disabled={!!parent}>
          <Reply />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to cast</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="parent"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com"
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
            `https://warpcast.com/${parent.cast.author.username}/${parent.cast.hash}`,
            '_blank'
          )
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            window.open(
              `https://warpcast.com/${parent.cast.author.username}/${parent.cast.hash}`,
              '_blank'
            )
          }
        }}
      >
        <p className="text-sm text-gray-600">Replying to</p>
        <div className="flex items-center gap-2">
          <img
            src={parent.cast.author.pfp_url}
            alt={parent.cast.author.username}
            className="w-6 h-6 rounded-full"
          />
          <p className="text-md font-bold">{parent.cast.author.username}</p>
        </div>
        <p className="text-md line-clamp-2">{parent.cast.text}</p>
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

function QuoteCast() {
  const { setQuote, embedCount, quote } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetQuote = async () => {
    setLoading(true)
    if (value) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-cast?identifier=${value}`
      )
      const data: GetCastResponse = await response.json()
      setQuote(data ?? null)
    }
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton tooltip="Quote cast" disabled={!!quote || embedCount >= 2}>
          <Quote />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quote cast</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="quote"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com"
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
            `https://warpcast.com/${quote.cast.author.username}/${quote.cast.hash}`,
            '_blank'
          )
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            window.open(
              `https://warpcast.com/${quote.cast.author.username}/${quote.cast.hash}`,
              '_blank'
            )
          }
        }}
      >
        <p className="text-sm text-gray-600">Quoting</p>
        <div className="flex items-center gap-2">
          <img
            src={quote.cast.author.pfp_url}
            alt={quote.cast.author.username}
            className="w-6 h-6 rounded-full"
          />
          <p className="text-md font-bold">{quote.cast.author.username}</p>
        </div>
        <p className="text-md line-clamp-2">{quote.cast.text}</p>
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

'use client'

import { useToast } from '@/hooks/use-toast'
import { Cast, Channel } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useState, ReactNode } from 'react'
import { hashMessage } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'
import { ToastAction } from '../ui/toast'
import { AnonWorldSDK } from '@anonworld/sdk'
type State =
  | {
      status: 'idle' | 'signature' | 'generating' | 'done'
    }
  | {
      status: 'error'
      error: string
    }

interface CreatePostContextProps {
  text: string | null
  setText: (text: string) => void
  image: string | null
  setImage: (image: string | null) => void
  embed: string | null
  setEmbed: (embed: string | null) => void
  quote: Cast | null
  setQuote: (quote: Cast | null) => void
  channel: Channel | null
  setChannel: (channel: Channel | null) => void
  parent: Cast | null
  setParent: (parent: Cast | null) => void
  createPost: () => Promise<void>
  embedCount: number
  state: State
  confetti: boolean
  setConfetti: (confetti: boolean) => void
  revealPhrase: string | null
  setRevealPhrase: (revealPhrase: string | null) => void
  variant: 'anoncast' | 'anonfun'
  setVariant: (variant: 'anoncast' | 'anonfun') => void
}

const CreatePostContext = createContext<CreatePostContextProps | undefined>(undefined)

export const CreatePostProvider = ({
  initialVariant,
  children,
}: {
  children: ReactNode
  initialVariant?: 'anoncast' | 'anonfun'
}) => {
  const sdk = new AnonWorldSDK(
    process.env.NEXT_PUBLIC_ANONWORLD_API_URL || 'http://localhost:3001'
  )
  const [text, setText] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [embed, setEmbed] = useState<string | null>(null)
  const [quote, setQuote] = useState<Cast | null>(null)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [parent, setParent] = useState<Cast | null>(null)
  const [revealPhrase, setRevealPhrase] = useState<string | null>(null)
  const [state, setState] = useState<State>({ status: 'idle' })
  const [confetti, setConfetti] = useState(false)
  const { toast } = useToast()
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [variant, setVariant] = useState<'anoncast' | 'anonfun'>(
    initialVariant || 'anoncast'
  )
  const router = useRouter()

  const resetState = () => {
    setState({ status: 'idle' })
    setText(null)
    setImage(null)
    setEmbed(null)
    setQuote(null)
    setChannel(null)
    setParent(null)
    setRevealPhrase(null)
  }

  const createPost = async () => {
    if (!address) return
    setState({ status: 'signature' })
    try {
      const embeds = [image, embed].filter((e) => e !== null) as string[]
      const data = {
        text: text ?? undefined,
        embeds,
        quote: quote?.hash,
        channel: channel?.id,
        parent: parent?.hash,
      }

      const message = JSON.stringify(data)
      const signature = await signMessageAsync({
        message,
      })
      if (!signature) {
        setState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      const messageHash = hashMessage(message)
      const revealHash = revealPhrase ? hashMessage(message + revealPhrase) : undefined

      setState({ status: 'generating' })

      const response = await sdk.performAction({
        address,
        signature,
        messageHash,
        data: {
          ...data,
          revealHash,
        },
        actionId: 'e6138573-7b2f-43ab-b248-252cdf5eaeee',
      })

      if (!response.data?.success) {
        throw new Error('Failed to post')
      }

      resetState()
      setConfetti(true)
      toast({
        title: 'Post created',
        action: (
          <ToastAction
            altText="View post"
            onClick={() => {
              window.open(
                `https://warpcast.com/~/conversations/${response.data.hash}`,
                '_blank'
              )
            }}
          >
            View on Warpcast
          </ToastAction>
        ),
      })
    } catch (e) {
      setState({ status: 'error', error: 'Failed to post' })
      console.error(e)
    }
  }

  const embedCount = [image, embed, quote].filter((e) => e !== null).length

  const handleSetVariant = (variant: 'anoncast' | 'anonfun') => {
    setVariant(variant)
    router.push(variant === 'anoncast' ? '/' : '/anonfun')
  }

  return (
    <CreatePostContext.Provider
      value={{
        text,
        setText,
        image,
        setImage,
        embed,
        setEmbed,
        quote,
        setQuote,
        channel,
        setChannel,
        parent,
        setParent,
        embedCount,
        createPost,
        state,
        confetti,
        setConfetti,
        revealPhrase,
        setRevealPhrase,
        variant,
        setVariant: handleSetVariant,
      }}
    >
      {children}
    </CreatePostContext.Provider>
  )
}

export const useCreatePost = () => {
  const context = useContext(CreatePostContext)
  if (context === undefined) {
    throw new Error('useCreatePost must be used within a CreatePostProvider')
  }
  return context
}

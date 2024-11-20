import { api } from '@/lib/api'
import { Cast } from '@/lib/types'
import { generateProof, ProofType } from '@anon/utils/src/proofs'
import { createContext, useContext, useState, ReactNode } from 'react'
import { hashMessage } from 'viem'

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
  channel: string | null
  setChannel: (channel: string | null) => void
  parent: Cast | null
  setParent: (parent: Cast | null) => void
  createPost: () => Promise<void>
  embedCount: number
  state: State
}

const CreatePostContext = createContext<CreatePostContextProps | undefined>(undefined)

export const CreatePostProvider = ({
  tokenAddress,
  userAddress,
  onSuccess,
  getSignature,
  children,
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
  children: ReactNode
}) => {
  const [text, setText] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [embed, setEmbed] = useState<string | null>(null)
  const [quote, setQuote] = useState<Cast | null>(null)
  const [channel, setChannel] = useState<string | null>(null)
  const [parent, setParent] = useState<Cast | null>(null)
  const [state, setState] = useState<State>({ status: 'idle' })

  const createPost = async () => {
    if (!userAddress) return

    setState({ status: 'signature' })
    try {
      const embeds = [image, embed].filter((e) => e !== null) as string[]
      const timestamp = Math.floor(Date.now() / 1000)
      const signatureData = await getSignature({
        address: userAddress,
        timestamp,
      })
      if (!signatureData) {
        setState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setState({ status: 'generating' })

      const proof = await generateProof({
        tokenAddress,
        userAddress,
        proofType: ProofType.CREATE_POST,
        signature: {
          timestamp,
          signature: signatureData.signature,
          messageHash: hashMessage(signatureData.message),
        },
        input: {
          text,
          embeds,
          quote: quote?.hash ?? null,
          channel,
          parent: parent?.hash ?? null,
        },
      })
      if (!proof) {
        setState({ status: 'error', error: 'Not allowed to post' })
        return
      }

      await api.submitAction(
        ProofType.CREATE_POST,
        Array.from(proof.proof),
        proof.publicInputs.map((i) => Array.from(i))
      )

      setState({ status: 'done' })

      onSuccess?.()
    } catch (e) {
      setState({ status: 'error', error: 'Failed to post' })
      console.error(e)
    }
  }

  const embedCount = [image, embed, quote].filter((e) => e !== null).length

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

import { Credential } from '@anonworld/common'
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth, useSDK } from '../../../providers'

interface NewCommunityContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  name: string
  setName: (name: string) => void
  description: string
  setDescription: (description: string) => void
  imageUrl: string
  setImageUrl: (imageUrl: string) => void
  username: string
  setUsername: (username: string) => void
  symbol: string
  setSymbol: (symbol: string) => void
  tokenType: 'new' | 'existing'
  setTokenType: (tokenType: 'new' | 'existing') => void
  postAmount: string
  setPostAmount: (postAmount: string) => void
  token?: { id: string; contractType: string; chainId: number; address: string }
  setToken: (token?: {
    id: string
    contractType: string
    chainId: number
    address: string
  }) => void
  isLoading: boolean
  createCommunity: () => Promise<void>
}

const NewCommunityContext = createContext<NewCommunityContextValue | null>(null)

export function NewCommunityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [username, setUsername] = useState('')
  const [tokenType, setTokenType] = useState<'new' | 'existing'>('new')
  const [symbol, setSymbol] = useState('')
  const [postAmount, setPostAmount] = useState('')
  const [token, setToken] = useState<
    | {
        id: string
        contractType: string
        chainId: number
        address: string
      }
    | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const { sdk } = useSDK()
  const { passkeyId } = useAuth()

  const createCommunity = async () => {
    setIsLoading(true)

    if (tokenType === 'new' && symbol) {
      await sdk.createCommunity({
        passkeyId,
        name,
        description,
        imageUrl,
        username,
        newToken: {
          symbol,
        },
      })
    } else if (tokenType === 'existing' && token) {
      await sdk.createCommunity({
        passkeyId,
        name,
        description,
        imageUrl,
        username,
        existingToken: token,
      })
    } else {
      throw new Error('Invalid token type')
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (token?.contractType === 'ERC721') {
      setPostAmount('1')
    }
  }, [token])

  return (
    <NewCommunityContext.Provider
      value={{
        isOpen,
        setIsOpen,
        name,
        setName,
        description,
        setDescription,
        imageUrl,
        setImageUrl,
        username,
        setUsername,
        symbol,
        setSymbol,
        tokenType,
        setTokenType,
        postAmount,
        setPostAmount,
        token,
        setToken,
        isLoading,
        createCommunity,
      }}
    >
      {children}
    </NewCommunityContext.Provider>
  )
}

export function useNewCommunity() {
  const context = useContext(NewCommunityContext)
  if (!context) {
    throw new Error('useNewCommunity must be used within a NewCommunityProvider')
  }
  return context
}

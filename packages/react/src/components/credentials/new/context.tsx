import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CredentialType, FungiblePosition } from '../../../types'
import { useSDK } from '../../../providers'
import { useWalletFungibles } from '../../../hooks/use-wallet-fungibles'
import { chainIdToZerion, zerionToChainId } from '../../../utils'

interface NewCredentialContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  credentialType: CredentialType
  setCredentialType: (credentialType: CredentialType) => void
  connectWallet: () => void
  isConnecting: boolean
  token: FungiblePosition | undefined
  setToken: (token?: { chainId: number; address: string }) => void
  balance: number
  setBalance: (balance: number) => void
  fungibles: FungiblePosition[]
}

const NewCredentialContext = createContext<NewCredentialContextValue | null>(null)

export function NewCredentialProvider({
  children,
  initialTokenId,
  initialBalance,
}: {
  children: React.ReactNode
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { connectWallet, isConnecting } = useSDK()
  const [credentialType, setCredentialType] = useState<CredentialType>(
    CredentialType.ERC20_BALANCE
  )
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [tokenId, setTokenId] = useState<
    { chainId: number; address: string } | undefined
  >(initialTokenId)
  const [balance, setBalance] = useState<number>(initialBalance ?? 0)

  const { data } = useWalletFungibles()

  const fungibles = useMemo(() => {
    if (!data) return []
    return data.filter((t) => {
      const impl = t.attributes.fungible_info.implementations.find(
        (i) => i.address !== null
      )
      return impl && t.attributes.value
    })
  }, [data])

  const handleConnectWallet = () => {
    if (!connectWallet) return
    setIsOpen(false)
    setIsConnectingWallet(true)
    connectWallet()
  }

  useEffect(() => {
    if (isConnectingWallet && !isConnecting) {
      setIsConnectingWallet(false)
      setIsOpen(true)
    }
  }, [isConnecting])

  useEffect(() => {
    if (fungibles.length > 0) {
      if (initialTokenId) {
        setTokenId(initialTokenId)
      } else {
        const token = fungibles[0]
        const chainId = token.relationships.chain.data.id
        const address = token.attributes.fungible_info.implementations.find(
          (i) => i.address !== null
        )?.address

        if (!chainId || !address) return

        setTokenId({ chainId: zerionToChainId[chainId], address })
      }
    }
  }, [fungibles])

  useEffect(() => {
    if (isOpen) {
      if (initialTokenId) {
        setTokenId(initialTokenId)
      }
      if (initialBalance) {
        setBalance(initialBalance)
      }
    }
  }, [isOpen, initialTokenId, initialBalance])

  const token = useMemo(() => {
    if (!tokenId) return
    const chainId = chainIdToZerion[tokenId.chainId]
    const token = fungibles.find((t) => {
      if (t.relationships.chain.data.id !== chainId) return false
      const impl = t.attributes.fungible_info.implementations.find(
        (i) =>
          i.address !== null &&
          i.address.toLowerCase() === tokenId.address.toLowerCase() &&
          i.chain_id === chainId
      )
      return impl
    })
    return token
  }, [fungibles, tokenId])

  useEffect(() => {
    if (token) {
      setBalance(Math.floor(token.attributes.quantity.float / 2))
    }
  }, [token])

  return (
    <NewCredentialContext.Provider
      value={{
        isOpen,
        setIsOpen,
        connectWallet: handleConnectWallet,
        credentialType,
        setCredentialType,
        isConnecting: isConnectingWallet,
        token,
        setToken: setTokenId,
        balance,
        setBalance,
        fungibles,
      }}
    >
      {children}
    </NewCredentialContext.Provider>
  )
}

export function useNewCredential() {
  const context = useContext(NewCredentialContext)
  if (!context) {
    throw new Error('useNewCredential must be used within a NewCredentialProvider')
  }
  return context
}

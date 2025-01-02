import { createContext, useContext, useState } from 'react'
import { useSwapQuote } from '../../../hooks/use-swap-quote'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'
import { SwapQuote, SwapQuoteError } from '@anonworld/common'

export type Token = {
  chainId: number
  address: string
}

interface SwapTokensContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  buyToken?: Token
  sellToken?: Token
  sellAmount?: number
  buyAmount?: number
  swapQuote?: SwapQuote | SwapQuoteError | null | undefined
}

const SwapTokensContext = createContext<SwapTokensContextValue | null>(null)

export function SwapTokensProvider({
  children,
  initialBuyToken,
  initialSellToken,
}: {
  children: React.ReactNode
  initialBuyToken?: Token
  initialSellToken?: Token
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [sellToken, setSellToken] = useState<Token>(
    initialSellToken ?? {
      chainId: initialBuyToken?.chainId ?? 8453,
      address: zeroAddress,
    }
  )
  const [buyToken, setBuyToken] = useState<Token | undefined>(
    initialBuyToken ?? {
      chainId: initialSellToken?.chainId ?? 8453,
      address: zeroAddress,
    }
  )
  const [sellAmount, setSellAmount] = useState<number | undefined>(undefined)
  const [buyAmount, setBuyAmount] = useState<number | undefined>(undefined)
  const { address } = useAccount()

  const { data: swapQuote } = useSwapQuote({
    chainId: sellToken.chainId,
    taker: address ?? zeroAddress,
    buyToken: buyToken?.address ?? zeroAddress,
    sellToken: sellToken.address,
    sellAmount: sellAmount?.toString() ?? '0',
  })

  return (
    <SwapTokensContext.Provider
      value={{
        isOpen,
        setIsOpen,
        buyToken,
        sellToken,
        sellAmount,
        buyAmount,
        swapQuote,
      }}
    >
      {children}
    </SwapTokensContext.Provider>
  )
}

export function useSwapTokens() {
  const context = useContext(SwapTokensContext)
  if (!context) {
    throw new Error('useSwapTokens must be used within a SwapTokensProvider')
  }
  return context
}

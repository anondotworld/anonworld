import {
  Button,
  Circle,
  Input,
  Spinner,
  Text,
  useToastController,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { useSwapTokens } from './context'
import { ChevronDown } from '@tamagui/lucide-icons'
import { TokenImage } from '../image'
import {
  useAccount,
  useChainId,
  useDisconnect,
  useSendTransaction,
  useSignTypedData,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { formatAddress, getZerionChain, Token } from '@anonworld/common'
import { useEffect } from 'react'
import { useWalletFungibles } from '../../../hooks/use-wallet-fungibles'
import { concat, Hex, numberToHex, size, zeroAddress } from 'viem'
import { Link } from 'solito/link'

export function SwapForm() {
  const {
    sellTokenData,
    buyTokenData,
    buyAmount,
    sellAmount,
    setSellAmount,
    isSwapQuoteFetching,
    invertSwap,
  } = useSwapTokens()
  const { address } = useAccount()

  return (
    <YStack gap="$4">
      <WalletField />
      {address && (
        <YStack>
          {sellTokenData && (
            <TokenField
              token={sellTokenData}
              value={sellAmount}
              onChange={setSellAmount}
              label="Sell"
            />
          )}
          <View ai="center" jc="center">
            <View
              bw="$0.5"
              bc="$borderColor"
              bg="$background"
              br="$12"
              p="$1.5"
              mt="$-2"
              mb="$-2"
              zi={1}
              cursor="pointer"
              hoverStyle={{ bg: '$color5' }}
              onPress={invertSwap}
            >
              <ChevronDown size={16} strokeWidth={2.5} />
            </View>
          </View>
          {buyTokenData && (
            <TokenField
              token={buyTokenData}
              disabled
              value={buyAmount}
              label="Buy"
              isLoading={isSwapQuoteFetching}
            />
          )}
          <SubmitButton />
        </YStack>
      )}
    </YStack>
  )
}

function TokenField({
  token,
  disabled,
  value,
  onChange,
  label,
  isLoading,
}: {
  token: Token
  disabled?: boolean
  value?: string
  onChange?: (value?: string) => void
  label: string
  isLoading?: boolean
}) {
  const { data } = useWalletFungibles()
  const handleChange = (text: string) => {
    if (text === '') {
      onChange?.(undefined)
      return
    }

    if (Number.isNaN(Number(text))) {
      onChange?.(value)
      return
    }

    onChange?.(text)
  }

  const position = data?.find((d) => {
    const chain = getZerionChain(d.relationships.chain.data.id)
    const impl = d.attributes.fungible_info.implementations.find(
      (i) =>
        i.chain_id === chain.zerionId &&
        ((i.address === null && token.address === zeroAddress) ||
          i.address === token.address)
    )
    return !!impl
  })

  return (
    <YStack
      ai="center"
      jc="space-between"
      bc="$borderColor"
      bw="$0.5"
      br="$4"
      p="$3"
      theme="surface1"
      bg="$background"
      gap="$2"
    >
      <XStack gap="$2" ai="center" jc="space-between" w="100%">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          {label}
        </Text>
        <Text
          fos="$2"
          fow="400"
          color="$color11"
          textTransform="uppercase"
          cursor="pointer"
          hoverStyle={disabled ? {} : { color: '$color12' }}
          onPress={() => {
            if (position?.attributes.quantity.float && !disabled) {
              handleChange(position.attributes.quantity.float.toString())
            }
          }}
        >
          {`${(position?.attributes.quantity.float ?? 0).toFixed(4)} ${token.symbol}`}
        </Text>
      </XStack>
      <XStack gap="$2" ai="center" jc="space-between" w="100%">
        <View h="$2" jc="center" f={1}>
          {isLoading ? (
            <Spinner color="$color12" />
          ) : (
            <Input
              unstyled
              placeholder="0"
              fow="600"
              fos={24}
              disabled={disabled}
              autoFocus={!disabled}
              value={value}
              onChangeText={handleChange}
              f={1}
            />
          )}
        </View>
        <XStack gap="$2" ai="center">
          <TokenImage token={token} size={24} />
          <Text fow="600" fos="$4">
            {token.symbol}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  )
}

export function WalletField() {
  const { connectWallet } = useSwapTokens()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <XStack
      ai="center"
      jc="space-between"
      bc="$borderColor"
      bw="$0.5"
      br="$4"
      py="$2.5"
      px="$3"
      theme="surface1"
      bg="$background"
    >
      <XStack gap="$2.5" ai="center" mx="$2">
        <Circle size={8} bg={address ? '$green11' : '$red11'} />
        <Text fos="$2" fow="400" color={address ? '$color12' : '$color11'}>
          {address ? formatAddress(address) : 'No wallet connected.'}
        </Text>
      </XStack>
      <Button
        size="$2.5"
        bg="$color12"
        br="$4"
        bw="$0"
        disabledStyle={{ opacity: 0.5, bg: '$color12' }}
        hoverStyle={{ opacity: 0.9, bg: '$color12' }}
        pressStyle={{ opacity: 0.9, bg: '$color12' }}
        onPress={() => {
          if (address) {
            disconnect()
          } else {
            connectWallet?.()
          }
        }}
      >
        <Text fos="$2" fow="600" color="$color1">
          {address ? 'Disconnect' : 'Connect'}
        </Text>
      </Button>
    </XStack>
  )
}

function SubmitButton() {
  const { swapQuote, setIsOpen, sellToken, sellTokenMax, sellAmount } = useSwapTokens()
  const { sendTransaction, data: hash, isPending: isSending } = useSendTransaction()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { isFetching: isReceiptFetching, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const toast = useToastController()
  const { refetch } = useWalletFungibles()
  const { signTypedDataAsync } = useSignTypedData()

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false)
      toast.show('Swapped tokens', {
        duration: 3000,
      })
      refetch()
    }
  }, [isSuccess])

  const handleSubmit = async () => {
    if (!swapQuote?.liquidityAvailable || !swapQuote.transaction) return

    if (sellToken && sellToken.chainId !== chainId) {
      await switchChainAsync({ chainId: sellToken.chainId })
    }

    let txData = swapQuote.transaction.data
    let signature: `0x${string}` | undefined
    if (swapQuote.permit2?.eip712) {
      // @ts-expect-error
      signature = await signTypedDataAsync(swapQuote.permit2.eip712)
      const signatureLengthInHex = numberToHex(size(signature), {
        signed: false,
        size: 32,
      })

      const sigLengthHex = signatureLengthInHex as Hex
      const sig = signature as Hex

      txData = concat([txData, sigLengthHex, sig])
    }

    sendTransaction({
      to: swapQuote.transaction.to,
      value: BigInt(swapQuote.transaction.value),
      data: txData,
      gas: BigInt(swapQuote.transaction.gas) * BigInt(10),
      gasPrice: BigInt(swapQuote.transaction.gasPrice) * BigInt(10),
    })
  }

  return (
    <YStack mt="$4" gap="$2">
      {hash && (
        <Link href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer">
          <Text
            color="$color11"
            fos="$1"
            textAlign="center"
            mt="$-2"
            textDecorationLine="underline"
          >
            {`Transaction: ${formatAddress(hash)}`}
          </Text>
        </Link>
      )}
      {sellTokenMax < Number(sellAmount ?? '0') && (
        <Text color="$red11" fos="$1" textAlign="center">
          Insufficient funds
        </Text>
      )}
      <Button
        bg="$color12"
        br="$4"
        disabled={
          isSending || isReceiptFetching || sellTokenMax < Number(sellAmount ?? '0')
        }
        disabledStyle={{ opacity: 0.5, bg: '$color12' }}
        hoverStyle={{ opacity: 0.9, bg: '$color12' }}
        pressStyle={{ opacity: 0.9, bg: '$color12' }}
        onPress={handleSubmit}
      >
        {isSending || isReceiptFetching ? (
          <XStack gap="$2" alignItems="center">
            <Spinner color="$color1" />
            <Text fos="$2" fow="600" color="$color1">
              Swapping Tokens
            </Text>
          </XStack>
        ) : (
          <Text fos="$3" fow="600" color="$color1">
            Swap Tokens
          </Text>
        )}
      </Button>
    </YStack>
  )
}

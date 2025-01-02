import {
  Adapt,
  Button,
  Circle,
  Input,
  Label,
  Select,
  Sheet,
  Slider,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { useNewCredential } from './context'
import { CredentialType, FungiblePosition } from '@anonworld/common'
import { useAccount, useDisconnect } from 'wagmi'
import { chainIdToZerion, formatAddress, zerionToChainId } from '../../../utils'
import { useEffect, useMemo, useState } from 'react'
import { useCredentials } from '../../../providers'
import { parseUnits } from 'viem'
import { useWalletFungibles } from '../../../hooks/use-wallet-fungibles'
import { TokenImage } from '../../tokens/image'

export function NewCredentialForm() {
  const { credentialType } = useNewCredential()
  if (credentialType === CredentialType.ERC20_BALANCE) {
    return <ERC20CredentialForm />
  }
  return <View />
}

function ERC20CredentialForm() {
  const { address } = useAccount()

  return (
    <YStack gap="$2">
      <WalletField />
      {address && (
        <>
          <TokenField />
          <BalanceField />
        </>
      )}
      <AddCredentialButton />
    </YStack>
  )
}

function WalletField() {
  const { address } = useAccount()
  const { connectWallet } = useNewCredential()
  const { disconnect } = useDisconnect()

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Wallet
      </Label>
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
    </YStack>
  )
}

function TokenField() {
  const { tokenId, setTokenId, setBalance, setMaxBalance, setDecimals } =
    useNewCredential()
  const [token, setToken] = useState<FungiblePosition | null>(null)

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

  useEffect(() => {
    if (fungibles.length === 0) return

    let token = fungibles[0]

    if (tokenId) {
      const chainId = chainIdToZerion[tokenId.chainId]
      const foundToken = fungibles.find((t) => {
        if (t.relationships.chain.data.id !== chainId) return false
        const impl = t.attributes.fungible_info.implementations.find(
          (i) =>
            i.address !== null &&
            i.address.toLowerCase() === tokenId.address.toLowerCase() &&
            i.chain_id === chainId
        )
        return impl
      })
      if (foundToken) {
        token = foundToken
      }
    }

    setToken(token)
  }, [fungibles, tokenId])

  const handleSelect = (id: string) => {
    const token = fungibles.find((t) => t.id === id)
    setToken(token ?? null)
  }

  useEffect(() => {
    if (!token) {
      setTokenId(undefined)
      setBalance(0)
      setMaxBalance(0)
      return
    }

    const chainId = token.relationships.chain.data.id
    const impl = token.attributes.fungible_info.implementations.find(
      (i) => i.address !== null && i.chain_id === chainId
    )

    if (!chainId || !impl?.address) return

    setTokenId({ chainId: zerionToChainId[chainId], address: impl.address })
    setBalance(Math.floor(token.attributes.quantity.float / 2))
    setMaxBalance(Math.floor(token.attributes.quantity.float))
    setDecimals(impl.decimals)
  }, [token])

  if (fungibles.length === 0) {
    return null
  }

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Token
      </Label>
      <Select value={token?.id} onValueChange={handleSelect} disablePreventBodyScroll>
        <Select.Trigger>{token && <TokenValue token={token} />}</Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            animation="quicker"
            zIndex={200000}
            modal
            dismissOnSnapToBottom
            snapPointsMode="fit"
          >
            <Sheet.Frame padding="$3" pb="$5" gap="$3" bg="$color2">
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label $xs={{ bg: '$color2' }}>Select a token</Select.Label>
              {fungibles.map((token, index) => (
                <Select.Item
                  key={token.id}
                  index={index}
                  value={token.id}
                  $xs={{ bg: '$color2' }}
                >
                  <TokenValue token={token} />
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>
    </YStack>
  )
}

function TokenValue({ token }: { token: FungiblePosition }) {
  const impl = token.attributes.fungible_info.implementations.find(
    (impl) => impl.chain_id === token.relationships.chain.data.id
  )

  if (!impl?.address) return null

  return (
    <XStack ai="center" jc="space-between" w="100%">
      <XStack gap="$3" ai="center">
        <TokenImage
          size={28}
          token={{
            address: impl.address,
            image_url: token.attributes.fungible_info.icon?.url ?? null,
          }}
        />
        <YStack>
          <Text fos="$2" fow="500">
            {token.attributes.fungible_info.name}
          </Text>
          <Text fos="$1" fow="400" color="$color11">
            {formatAddress(impl.address)}
          </Text>
        </YStack>
      </XStack>
      <XStack gap="$2" ai="center">
        <YStack ai="flex-end">
          <Text fos="$2" fow="500">
            {`${token.attributes.quantity.float.toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}`}
          </Text>
          <Text fos="$1" fow="400" color="$color11">
            {`$${token.attributes.value?.toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}`}
          </Text>
        </YStack>
      </XStack>
    </XStack>
  )
}

function BalanceField() {
  const { balance, setBalance, maxBalance } = useNewCredential()

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Balance
      </Label>
      <Slider
        value={[Math.min(balance, maxBalance)]}
        max={maxBalance}
        onValueChange={(value) => setBalance(value[0])}
      >
        <Slider.Track>
          <Slider.TrackActive bg="$color12" />
        </Slider.Track>
        <Slider.Thumb size="$1" index={0} circular />
      </Slider>
      <XStack jc="space-between" mt="$3" ai="center">
        <Input
          unstyled
          value={balance.toString()}
          onChangeText={(value) => setBalance(Number(value))}
          bc="$borderColor"
          bw="$0.5"
          br="$2"
          py="$1.5"
          px="$2"
          w="$12"
          theme="surface1"
          bg="$background"
        />
        <View
          onPress={() => setBalance(maxBalance)}
          cursor="pointer"
          opacity={0.75}
          hoverStyle={{ opacity: 1 }}
        >
          <Text fos="$2" fow="500">
            Max
          </Text>
        </View>
      </XStack>
    </YStack>
  )
}

function AddCredentialButton() {
  const { address } = useAccount()
  const { tokenId, balance, setIsOpen, decimals } = useNewCredential()
  const { add } = useCredentials()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleAddCredential = async () => {
    if (!tokenId) return
    try {
      setIsLoading(true)
      await add({
        chainId: tokenId.chainId,
        tokenAddress: tokenId.address as `0x${string}`,
        verifiedBalance: parseUnits(balance.toString(), decimals),
      })
      setIsLoading(false)
      setIsOpen(false)
    } catch (e) {
      setError((e as Error).message ?? 'Failed to add credential')
      setIsLoading(false)
    }
  }

  return (
    <YStack mt="$4" gap="$2">
      {error && (
        <Text color="$red11" textAlign="center" mt="$-2">
          {error}
        </Text>
      )}
      <Button
        bg="$color12"
        br="$4"
        disabled={!address || isLoading || balance === 0}
        disabledStyle={{ opacity: 0.5, bg: '$color12' }}
        hoverStyle={{ opacity: 0.9, bg: '$color12' }}
        pressStyle={{ opacity: 0.9, bg: '$color12' }}
        onPress={handleAddCredential}
      >
        {!isLoading ? (
          <Text fos="$3" fow="600" color="$color1">
            {address ? 'Add Credential' : 'Connect Wallet'}
          </Text>
        ) : (
          <Spinner color="$color1" />
        )}
      </Button>
    </YStack>
  )
}

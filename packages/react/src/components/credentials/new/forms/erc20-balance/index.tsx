import {
  Adapt,
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
import { NewERC20CredentialProvider, useNewERC20Credential } from './context'
import { FungiblePosition, getChain, getZerionChain } from '@anonworld/common'
import { useAccount } from 'wagmi'
import { formatAddress } from '@anonworld/common'
import { useEffect, useMemo, useState } from 'react'
import { useWalletFungibles } from '../../../../../hooks/use-wallet-fungibles'
import { TokenImage } from '../../../../tokens/image'
import { WalletField } from '../components/wallet-field'
import { SubmitButton } from '../components/submit-button'

export function ERC20CredentialForm({
  initialTokenId,
  initialBalance,
  isOpen,
  setIsOpen,
}: {
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const { address } = useAccount()

  return (
    <NewERC20CredentialProvider
      initialTokenId={initialTokenId}
      initialBalance={initialBalance}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <YStack gap="$2">
        <ERC20WalletField />
        {address && (
          <>
            <TokenField />
            <BalanceField />
          </>
        )}
        <ERC20SubmitButton />
      </YStack>
    </NewERC20CredentialProvider>
  )
}

function ERC20WalletField() {
  const { connectWallet } = useNewERC20Credential()

  return <WalletField connectWallet={connectWallet} />
}

function TokenField() {
  const { tokenId, setTokenId, setBalance, setMaxBalance, setDecimals } =
    useNewERC20Credential()
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

    let selectedToken = fungibles[0]

    if (tokenId) {
      const chain = getChain(tokenId.chainId)
      if (!chain.zerionId) return
      const foundToken = fungibles.find((t) => {
        if (t.relationships.chain.data.id !== chain.zerionId) return false
        const impl = t.attributes.fungible_info.implementations.find(
          (i) =>
            i.address !== null &&
            i.address.toLowerCase() === tokenId.address.toLowerCase() &&
            i.chain_id === chain.zerionId
        )
        return impl
      })
      if (foundToken) {
        selectedToken = foundToken
      }
    }

    handleSelect(selectedToken.id)
  }, [fungibles])

  const handleSelect = (id: string) => {
    const token = fungibles.find((t) => t.id === id)
    if (!token) {
      setToken(null)
      setTokenId(undefined)
      setBalance(0)
      setMaxBalance(0)
      return
    }

    setToken(token)

    const chainId = token.relationships.chain.data.id
    const impl = token.attributes.fungible_info.implementations.find(
      (i) => i.address !== null && i.chain_id === chainId
    )

    if (!chainId || !impl?.address) return

    const chain = getZerionChain(chainId)
    if (!chain?.zerionId) return

    setTokenId({ chainId: chain.id, address: impl.address })
    setBalance(Math.floor(token.attributes.quantity.float / 2))
    setMaxBalance(Math.floor(token.attributes.quantity.float))
    setDecimals(impl.decimals)
  }

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Token
      </Label>
      <Select value={token?.id} onValueChange={handleSelect} disablePreventBodyScroll>
        <Select.Trigger>
          {token ? <TokenValue token={token} /> : <Spinner color="$color12" />}
        </Select.Trigger>

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
              {useMemo(
                () =>
                  fungibles.map((token, index) => (
                    <Select.Item
                      key={token.id}
                      index={index}
                      value={token.id}
                      $xs={{ bg: '$color2' }}
                    >
                      <TokenValue token={token} />
                    </Select.Item>
                  )),
                [fungibles]
              )}
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

  const chain = getZerionChain(impl.chain_id)

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
            {`${chain.name} | ${formatAddress(impl.address)}`}
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
  const { balance, setBalance, maxBalance } = useNewERC20Credential()

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

function ERC20SubmitButton() {
  const { address } = useAccount()
  const { handleAddCredential, balance, isLoading, error } = useNewERC20Credential()
  return (
    <SubmitButton
      onSubmit={handleAddCredential}
      disabled={!address || balance === 0}
      disabledText={balance === 0 ? 'Select a token' : 'Connect Wallet'}
      error={error}
      isLoading={isLoading}
    />
  )
}

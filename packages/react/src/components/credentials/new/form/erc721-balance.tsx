import { Adapt, Label, Select, Sheet, Spinner, Text, XStack, YStack } from '@anonworld/ui'
import { useNewCredential } from '../context'
import {
  getChain,
  getSimplehashChain,
  getZerionChain,
  NFTPosition,
  SimplehashNFT,
} from '@anonworld/common'
import { useAccount } from 'wagmi'
import { useEffect, useMemo, useState } from 'react'
import { TokenImage } from '../../../tokens/image'
import { WalletField } from './components/wallet-field'
import { SubmitButton } from './components/submit-button'
import { useWalletNFTs } from '../../../../hooks/use-wallet-nfts'

export function ERC721CredentialForm() {
  const { address } = useAccount()

  return (
    <YStack gap="$2">
      <WalletField />
      {address && <TokenField />}
      <SubmitButton />
    </YStack>
  )
}

function TokenField() {
  const { tokenId, setTokenId, setBalance } = useNewCredential()
  const [token, setToken] = useState<SimplehashNFT | null>(null)

  const { data } = useWalletNFTs()

  useEffect(() => {
    if (!data || data.length === 0) return

    let selectedToken = data[0]

    if (tokenId) {
      const chain = getChain(tokenId.chainId)
      if (!chain.simplehashId) return
      const foundToken = data.find((t) => {
        return (
          t.contract_address.toLowerCase() === tokenId.address.toLowerCase() &&
          t.chain === chain.simplehashId
        )
      })
      if (foundToken) {
        selectedToken = foundToken
      }
    }

    handleSelect(selectedToken.nft_id)
  }, [data])

  const handleSelect = (id: string) => {
    const token = data?.find((t) => t.nft_id === id)
    if (!token) {
      setToken(null)
      setTokenId(undefined)
      setBalance(0)
      return
    }

    setToken(token)

    const chain = getSimplehashChain(token.chain)
    if (!chain?.simplehashId) return

    setTokenId({ chainId: chain.id, address: token.contract_address })
    setBalance(1)
  }

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Token
      </Label>
      <Select value={token?.nft_id} onValueChange={handleSelect} disablePreventBodyScroll>
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
                  data?.map((token, index) => (
                    <Select.Item
                      key={token.nft_id}
                      index={index}
                      value={token.nft_id}
                      $xs={{ bg: '$color2' }}
                    >
                      <TokenValue token={token} />
                    </Select.Item>
                  )),
                [data]
              )}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>
    </YStack>
  )
}

function TokenValue({ token }: { token: SimplehashNFT }) {
  const chain = getSimplehashChain(token.chain)

  let floorPrice = 0
  if (token.collection.floor_prices && token.collection.floor_prices.length > 0) {
    floorPrice = Math.max(
      ...token.collection.floor_prices.map(
        (floorPrice) => floorPrice.value_usd_cents / 100
      )
    )
  }

  return (
    <XStack ai="center" jc="space-between" w="100%">
      <XStack gap="$3" ai="center">
        <TokenImage
          size={28}
          token={{
            address: token.contract_address,
            image_url:
              token.previews.image_small_url ??
              token.previews.image_medium_url ??
              token.previews.image_large_url ??
              token.image_url ??
              token.previews.image_opengraph_url ??
              null,
          }}
        />
        <YStack>
          <Text fos="$2" fow="500">
            {token.name || `#${token.token_id}`}
          </Text>
          <Text fos="$1" fow="400" color="$color11">
            {`${chain.name} | ${token.collection.name}`}
          </Text>
        </YStack>
      </XStack>
      <XStack gap="$2" ai="center">
        {floorPrice > 0 && (
          <YStack ai="flex-end">
            <Text fos="$2" fow="500">
              {`${floorPrice.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}`}
            </Text>
          </YStack>
        )}
      </XStack>
    </XStack>
  )
}

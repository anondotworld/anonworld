import { Button, Image, Separator, Text, XStack, YStack } from '@anonworld/ui'
import { Field } from '../../field'
import { chains, formatAddress, formatAmount } from '../../../utils'
import { ArrowLeftRight, ArrowUpRight } from '@tamagui/lucide-icons'
import { useToken } from '../../../hooks'
import { extractChain } from 'viem'
import { Community } from '../../../types'
import { CommunityActions } from './actions'

export function CommunityToken({ community }: { community: Community }) {
  const { data } = useToken({
    chainId: community.chain_id,
    address: community.token_address,
  })

  const chain = extractChain({ chains, id: Number(community.chain_id) as any })
  return (
    <YStack gap="$4" mt="$2">
      <XStack gap="$4" ai="center">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Token
        </Text>
        <Separator />
      </XStack>
      <XStack ai="center" jc="space-between">
        <YStack gap="$1" minWidth="$10">
          <XStack ai="center" gap="$2">
            {data?.attributes.icon.url && (
              <Image src={data?.attributes.icon.url} w={16} h={16} />
            )}
            <Text fow="600">{data?.attributes.symbol}</Text>
          </XStack>
          <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
            {`${chain.name} | ${formatAddress(community.token_address)}`}
          </Text>
        </YStack>
        <XStack gap="$4" ai="center" jc="flex-end" px="$4" fg={1}>
          <Field
            label="Mkt Cap"
            value={`$${formatAmount(community.market_cap)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Price"
            value={`$${Number(community.price_usd).toFixed(4)}`}
            minWidth="$10"
            ai="flex-end"
          />
          <Field
            label="Holders"
            value={formatAmount(community.holders)}
            minWidth="$10"
            ai="flex-end"
          />
        </XStack>
      </XStack>
      <XStack gap="$2" ai="center" jc="space-between">
        <CommunityActions community={community} />
        <XStack gap="$2">
          <Button
            size="$2"
            px="$3"
            bg="$background"
            bc="$borderColor"
            bw="$0.25"
            br="$12"
            hoverStyle={{ opacity: 0.9 }}
            onPress={() =>
              window.open(
                `https://dexscreener.com/${chain.name.toLowerCase()}/${community.token_address}`,
                '_blank'
              )
            }
          >
            <XStack ai="center" gap="$1">
              <ArrowUpRight size={12} />
              <Text fos="$1">DexScreener</Text>
            </XStack>
          </Button>
          <Button
            size="$2"
            themeInverse
            px="$3"
            bg="$background"
            bc="$borderColor"
            bw="$0.25"
            br="$12"
            hoverStyle={{ opacity: 0.9 }}
          >
            <XStack ai="center" gap="$1">
              <ArrowLeftRight size={12} strokeWidth={2.5} />
              <Text fos="$1" fow="600">
                Swap
              </Text>
            </XStack>
          </Button>
        </XStack>
      </XStack>
    </YStack>
  )
}

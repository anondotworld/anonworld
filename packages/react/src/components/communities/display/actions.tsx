import { MoreHorizontal } from '@tamagui/lucide-icons'
import { Community } from '../../../types'
import { Popover, Text, View, YGroup } from '@anonworld/ui'
import { extractChain } from 'viem'
import { chains } from '../../../utils'
import { DexScreener } from '../../svg/dexscreener'
import { Etherscan } from '../../svg/etherscan'

export function CommunityActions({ community }: { community: Community }) {
  const chain = extractChain({ chains, id: Number(community.chain_id) as any })
  return (
    <Popover size="$5" placement="bottom">
      <Popover.Trigger>
        <View p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
          <MoreHorizontal size={20} />
        </View>
      </Popover.Trigger>
      <Popover.Content
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          '100ms',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
        cursor="pointer"
        bordered
        overflow="hidden"
        userSelect="none"
      >
        <YGroup>
          <YGroup.Item>
            <View
              fd="row"
              gap="$2"
              px="$3.5"
              py="$2.5"
              hoverStyle={{ bg: '$color5' }}
              onPress={() =>
                window.open(
                  `https://dexscreener.com/${chain.name.toLowerCase()}/${community.token_address}`,
                  '_blank'
                )
              }
            >
              <DexScreener size={16} />
              <Text fos="$2" fow="400">
                DexScreener
              </Text>
            </View>
          </YGroup.Item>
          <YGroup.Item>
            <View
              fd="row"
              gap="$2"
              px="$3.5"
              py="$2.5"
              hoverStyle={{ bg: '$color5' }}
              onPress={() =>
                window.open(
                  `https://basescan.org/token/${community.token_address}`,
                  '_blank'
                )
              }
            >
              <Etherscan size={16} />
              <Text fos="$2" fow="400">
                BaseScan
              </Text>
            </View>
          </YGroup.Item>
        </YGroup>
      </Popover.Content>
    </Popover>
  )
}

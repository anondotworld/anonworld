import { MoreHorizontal, Pencil } from '@tamagui/lucide-icons'
import { Community, ContractType, getChain } from '@anonworld/common'
import { Dialog, Popover, Text, View, YGroup } from '@anonworld/ui'
import { DexScreener } from '../../svg/dexscreener'
import { Etherscan } from '../../svg/etherscan'
import { Uniswap } from '../../svg/uniswap'
import { Link } from 'solito/link'
import { Clanker } from '../../svg/clanker'
import { useAuth } from '../../../providers'
import { CommunitySettings } from '../settings'

export function CommunityActions({ community }: { community: Community }) {
  const chain = getChain(Number(community.token.chain_id))
  const { passkeyId } = useAuth()
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
          {community.passkey_id === passkeyId &&
            community.token.type === ContractType.ERC20 && (
              <CommunitySettings community={community}>
                <Dialog.Trigger>
                  <YGroup.Item>
                    <View
                      fd="row"
                      gap="$2"
                      px="$3.5"
                      py="$2.5"
                      hoverStyle={{ bg: '$color5' }}
                    >
                      <Pencil size={16} />
                      <Text fos="$2" fow="400">
                        Edit Actions
                      </Text>
                    </View>
                  </YGroup.Item>
                </Dialog.Trigger>
              </CommunitySettings>
            )}
          {community.token.platform === 'clanker' && (
            <YGroup.Item>
              <Link
                href={`https://www.clanker.world/clanker/${community.token.address}`}
                target="_blank"
              >
                <View
                  fd="row"
                  gap="$2"
                  px="$3.5"
                  py="$2.5"
                  hoverStyle={{ bg: '$color5' }}
                >
                  <Clanker w={16} />
                  <Text fos="$2" fow="400">
                    Clanker
                  </Text>
                </View>
              </Link>
            </YGroup.Item>
          )}
          <YGroup.Item>
            <Link
              href={`https://app.uniswap.org/swap?outputCurrency=${community.token.address}&chain=${chain.id}&inputCurrency=ETH`}
              target="_blank"
            >
              <View fd="row" gap="$2" px="$3.5" py="$2.5" hoverStyle={{ bg: '$color5' }}>
                <Uniswap size={16} />
                <Text fos="$2" fow="400">
                  Uniswap
                </Text>
              </View>
            </Link>
          </YGroup.Item>

          <YGroup.Item>
            <Link
              href={`https://dexscreener.com/${chain.name.toLowerCase()}/${community.token.address}`}
              target="_blank"
            >
              <View fd="row" gap="$2" px="$3.5" py="$2.5" hoverStyle={{ bg: '$color5' }}>
                <DexScreener size={16} />
                <Text fos="$2" fow="400">
                  DexScreener
                </Text>
              </View>
            </Link>
          </YGroup.Item>
          <YGroup.Item>
            <Link
              href={`https://basescan.org/token/${community.token.address}`}
              target="_blank"
            >
              <View fd="row" gap="$2" px="$3.5" py="$2.5" hoverStyle={{ bg: '$color5' }}>
                <Etherscan size={16} />
                <Text fos="$2" fow="400">
                  BaseScan
                </Text>
              </View>
            </Link>
          </YGroup.Item>
        </YGroup>
      </Popover.Content>
    </Popover>
  )
}

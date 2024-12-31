import { LogOut } from '@tamagui/lucide-icons'
import { Popover, Text, View, YGroup } from '@anonworld/ui'
import { NamedExoticComponent, ReactNode } from 'react'
import { useSDK } from '../../providers'
import { formatHexId, toHslColors } from '../../utils'
import { LinearGradient } from '@tamagui/linear-gradient'
import { useVaults } from '../../hooks/use-vaults'

export function AuthActions({ passkeyId }: { passkeyId: string }) {
  const { auth } = useSDK()
  const { data: vaults } = useVaults(passkeyId)
  const { background, secondary } = toHslColors(formatHexId(vaults?.[0]?.id ?? ''))

  return (
    <Popover size="$5" placement="bottom">
      <Popover.Trigger
        onPress={(e) => {
          e.stopPropagation()
        }}
        cursor="pointer"
      >
        <LinearGradient
          width={32}
          height={32}
          borderRadius="$12"
          colors={[secondary, background]}
          start={[1, 1]}
          end={[0, 0]}
        />
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
        bordered
        overflow="hidden"
      >
        <YGroup>
          {vaults?.map((vault) => {
            const displayId = formatHexId(vault.id)
            const { background, secondary } = toHslColors(displayId)
            return (
              <ActionItem
                key={vault.id}
                label={displayId}
                image={
                  <LinearGradient
                    width={16}
                    height={16}
                    borderRadius="$12"
                    colors={[secondary, background]}
                    start={[1, 1]}
                    end={[0, 0]}
                  />
                }
              />
            )
          })}
          <ActionItem label="Logout" onPress={auth.logout} Icon={LogOut} destructive />
        </YGroup>
      </Popover.Content>
    </Popover>
  )
}

function ActionItem({
  label,
  onPress,
  Icon,
  image,
  destructive = false,
}: {
  label: string
  onPress?: () => void
  Icon?: NamedExoticComponent<any>
  image?: ReactNode
  destructive?: boolean
}) {
  return (
    <YGroup.Item>
      <View
        onPress={onPress}
        fd="row"
        ai="center"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={onPress ? { bg: '$color5' } : {}}
        cursor={onPress ? 'pointer' : 'default'}
      >
        {Icon && <Icon size={16} color={destructive ? '$red9' : undefined} />}
        {image}
        <Text fos="$2" fow="400" color={destructive ? '$red9' : undefined}>
          {label}
        </Text>
      </View>
    </YGroup.Item>
  )
}

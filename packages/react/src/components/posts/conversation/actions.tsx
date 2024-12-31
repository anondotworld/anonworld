import { MoreHorizontal } from '@tamagui/lucide-icons'
import { Popover, Text, View, YGroup } from '@anonworld/ui'
import { Cast } from '../../../types'
import { Farcaster } from '../../svg/farcaster'
import { NamedExoticComponent } from 'react'
import { Link } from 'solito/link'

export function PostActions({ post }: { post: Cast }) {
  return (
    <Popover size="$5" placement="bottom">
      <Popover.Trigger
        onPress={(e) => {
          e.stopPropagation()
        }}
      >
        <View
          bg="$color3"
          p="$2"
          br="$12"
          hoverStyle={{ bg: '$color4' }}
          cursor="pointer"
        >
          <MoreHorizontal size={14} col="$color11" />
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
      >
        <YGroup>
          <Link
            href={`https://warpcast.com/~/conversations/${post.hash}`}
            target="_blank"
          >
            <ActionButton label="View on Farcaster" Icon={Farcaster} />
          </Link>
        </YGroup>
      </Popover.Content>
    </Popover>
  )
}

function ActionButton({
  label,
  Icon,
  destructive = false,
}: {
  label: string
  Icon?: NamedExoticComponent<any>
  destructive?: boolean
}) {
  return (
    <YGroup.Item>
      <View
        fd="row"
        ai="center"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={{ bg: '$color5' }}
      >
        {Icon && <Icon size={16} color={destructive ? '$red9' : undefined} />}
        <Text fos="$2" fow="400" color={destructive ? '$red9' : undefined}>
          {label}
        </Text>
      </View>
    </YGroup.Item>
  )
}

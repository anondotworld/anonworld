import { NamedExoticComponent, ReactNode } from 'react'
import { XStack, Text } from '@anonworld/ui'

export const variants = {
  default: {
    color: '$color12',
    bg: '$color4',
    hoverStyle: { bg: '$color5' },
  },
  conversation: {
    color: '$color11',
    bg: '$color3',
    hoverStyle: { bg: '$color4' },
  },
}

export function ActionButton({
  variant = 'default',
  Icon,
  onPress,
  children,
  iconFocus,
}: {
  variant?: keyof typeof variants
  Icon: NamedExoticComponent<{ size: number; fill?: string; col?: string }>
  onPress?: () => void
  children: ReactNode
  iconFocus?: string
}) {
  const { color, bg, hoverStyle } = variants[variant]

  return (
    <XStack
      ai="center"
      gap="$2"
      bg={bg}
      br="$12"
      px="$2.5"
      py="$2"
      hoverStyle={hoverStyle}
      cursor="pointer"
      onPress={onPress}
    >
      <Icon size={14} fill={iconFocus ?? undefined} col={iconFocus ?? color} />
      <Text fos="$1" col={color}>
        {children}
      </Text>
    </XStack>
  )
}

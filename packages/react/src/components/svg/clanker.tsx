import { memo } from 'react'
import type { IconProps } from '@tamagui/helpers-icon'
import { Svg, Path } from 'react-native-svg'
import { themed } from '@tamagui/helpers-icon'

const Icon = (props) => {
  const { color = 'black', size = 16, ...otherProps } = props
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 940 1000"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <Path d="M0 1000V757.576H181.818V1000H0Z" fill={color} />
      <Path d="M378.788 1000V378.788H560.606V1000H378.788Z" fill={color} />
      <Path d="M939.394 1000H757.576V0H939.394V1000Z" fill={color} />
    </Svg>
  )
}

Icon.displayName = 'Clanker'

export const Clanker = memo<IconProps>(themed(Icon))

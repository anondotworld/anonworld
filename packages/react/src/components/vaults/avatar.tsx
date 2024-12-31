import { toHslColors } from '../../utils'
import { LinearGradient } from '@tamagui/linear-gradient'

export function VaultAvatar({ id, size = 16 }: { id: string; size?: number | string }) {
  const { background, secondary } = toHslColors(id)
  return (
    <LinearGradient
      width={size}
      height={size}
      borderRadius="$12"
      colors={[secondary, background]}
      start={[1, 1]}
      end={[0, 0]}
    />
  )
}

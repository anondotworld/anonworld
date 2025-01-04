import { Avatar, AvatarFallback, AvatarImage } from '@anonworld/ui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { toHslColors } from '../../utils'

export function TokenImage({
  token,
  size = 16,
}: {
  token?: { address: string; chain_id?: number; image_url?: string | null }
  size?: number
}) {
  const { background, secondary } = toHslColors(token?.address ?? '')
  return (
    <Avatar circular size={size}>
      <AvatarImage src={token?.image_url ?? undefined} w={size} h={size} />
      <AvatarFallback>
        <LinearGradient
          colors={[secondary, background]}
          start={[1, 1]}
          end={[0, 0]}
          fg={1}
        />
      </AvatarFallback>
    </Avatar>
  )
}

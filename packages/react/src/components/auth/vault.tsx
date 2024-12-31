import { Vault } from '../../types'
import { formatHexId, toHslColors } from '../../utils'
import { Badge } from '../badge'
import { LinearGradient } from '@tamagui/linear-gradient'

export function VaultBadge({ vault }: { vault: Vault | null }) {
  if (!vault)
    return (
      <Badge
        icon={
          <LinearGradient
            width={16}
            height={16}
            borderRadius="$12"
            colors={['$color10', '$color12']}
            start={[1, 1]}
            end={[0, 0]}
          />
        }
      >
        No Profile
      </Badge>
    )

  const id = formatHexId(vault.id)
  const { background, secondary } = toHslColors(id)

  return (
    <Badge
      icon={
        <LinearGradient
          width={16}
          height={16}
          borderRadius="$12"
          colors={[secondary, background]}
          start={[1, 1]}
          end={[0, 0]}
        />
      }
    >
      {id}
    </Badge>
  )
}

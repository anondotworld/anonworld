import { formatHexId } from '../../utils'
import { Badge } from '../badge'
import { LinearGradient } from '@tamagui/linear-gradient'
import { VaultAvatar } from './avatar'

export function VaultBadge({ vaultId }: { vaultId: string | null }) {
  if (!vaultId)
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

  const id = formatHexId(vaultId)

  return (
    <Badge
      icon={<VaultAvatar id={id} />}
      onPress={() => {
        window.location.href = `/profiles/${vaultId}`
      }}
    >
      {id}
    </Badge>
  )
}

import { FarcasterFidCredential, formatAmount } from '@anonworld/common'
import { View } from '@anonworld/ui'
import { Farcaster } from '../../../svg/farcaster'
import { Badge } from '../../../badge'

export function FarcasterFidBadge({
  credential,
}: { credential: FarcasterFidCredential }) {
  const fid = credential.metadata.fid
  return (
    <Badge
      icon={
        <View bg="$color5" w={16} h={16} ai="center" jc="center" br="$4">
          <Farcaster size={12} />
        </View>
      }
    >{`< ${formatAmount(fid)} FID`}</Badge>
  )
}

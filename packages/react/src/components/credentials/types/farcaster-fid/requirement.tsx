import { Action, FarcasterFidCredentialRequirement } from '@anonworld/common'
import { Text } from '@anonworld/ui'
import { formatAmount } from '@anonworld/common'

export function FarcasterFidRequirement({
  action,
  req,
}: {
  action: Action
  req: FarcasterFidCredentialRequirement
}) {
  return (
    <Text fos="$1" fow="500" color="$color10">
      {`req: < ${formatAmount(req.fid)}`}
    </Text>
  )
}

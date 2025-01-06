import { FarcasterFidCredential, formatAmount } from '@anonworld/common'
import { Text, View, XStack } from '@anonworld/ui'
import { Farcaster } from '../../../svg/farcaster'

export function FarcasterFidSelect({
  credential,
}: { credential: FarcasterFidCredential }) {
  return (
    <XStack gap="$2" ai="center" jc="space-between" f={1}>
      <View bg="$color5" w={16} h={16} ai="center" jc="center" br="$4">
        <Farcaster size={12} />
      </View>
      <Text fos="$2" fow="500">
        {`< ${formatAmount(credential.metadata.fid)} FID`}
      </Text>
    </XStack>
  )
}

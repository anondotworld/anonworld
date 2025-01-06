import { FarcasterFidCredential, formatAmount } from '@anonworld/common'
import { XStack } from '@anonworld/ui'
import { Field } from '../../../field'
import { Farcaster } from '../../../svg/farcaster'

export function FarcasterFidDisplay({
  credential,
}: { credential: FarcasterFidCredential }) {
  return (
    <XStack gap="$4" $xs={{ flexDirection: 'column', gap: '$2', ai: 'flex-start' }}>
      {[
        {
          label: 'Farcaster ID',
          value: `< ${formatAmount(credential.metadata.fid)}`,
          imageComponent: <Farcaster size={16} />,
        },
      ].map(({ label, value, imageComponent }) => (
        <Field key={label} label={label} value={value} imageComponent={imageComponent} />
      ))}
    </XStack>
  )
}

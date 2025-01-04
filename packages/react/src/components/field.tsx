import { Image, Text, XStack, YStack } from '@anonworld/ui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { toHslColors } from '../utils'

export function Field({
  label,
  value,
  image,
  imageFallbackText,
  minWidth = '$14',
  ai = 'flex-start',
}: {
  label: string
  value?: string
  image?: string
  imageFallbackText?: string
  minWidth?: number | string
  ai?: 'flex-start' | 'flex-end'
}) {
  const { background, secondary } = toHslColors(imageFallbackText ?? '')
  return (
    <YStack
      key={label}
      gap="$1"
      minWidth={minWidth}
      ai={ai}
      $xs={{ flexDirection: 'row-reverse', gap: '$2', jc: 'flex-end' }}
    >
      <XStack ai={ai} gap="$2">
        {image && <Image src={image} w={16} h={16} br="$12" />}
        {!image && imageFallbackText && (
          <LinearGradient
            colors={[secondary, background]}
            start={[1, 1]}
            end={[0, 0]}
            fg={1}
            w={16}
            h={16}
            br="$12"
          />
        )}
        <Text fow="600" $xs={{ fontSize: '$1' }}>
          {value}
        </Text>
      </XStack>
      <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
        {label}
      </Text>
    </YStack>
  )
}

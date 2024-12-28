import { Image, Text, XStack, YStack } from '@anonworld/ui'

export function Field({
  label,
  value,
  image,
  minWidth = '$14',
  ai = 'flex-start',
}: {
  label: string
  value?: string
  image?: string
  minWidth?: number | string
  ai?: 'flex-start' | 'flex-end'
}) {
  return (
    <YStack key={label} gap="$1" minWidth={minWidth} ai={ai}>
      <XStack ai={ai} gap="$2">
        {image && <Image src={image} w={16} h={16} />}
        <Text fow="600">{value}</Text>
      </XStack>
      <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
        {label}
      </Text>
    </YStack>
  )
}

import { toHslColors } from '../../../utils'
import { Text, View } from '@anonworld/ui'
import { LinearGradient } from '@tamagui/linear-gradient'

export function CredentialId({ id }: { id: string }) {
  const { background, color } = toHslColors(id)
  return (
    <View
      theme="surface3"
      bg={background}
      br="$12"
      py="$1.5"
      fd="row"
      ai="center"
      gap="$1.5"
      alignSelf="flex-start"
      w="$8"
      jc="center"
    >
      <Text fos="$1" color={color} fow="500">
        {id}
      </Text>
    </View>
  )
}

export function CredentialAvatar({
  id,
  size = '$2.5',
}: { id: string; size?: number | string }) {
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

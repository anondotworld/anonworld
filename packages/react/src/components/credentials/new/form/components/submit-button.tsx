import { Button, Spinner, Text, YStack } from '@anonworld/ui'
import { useAccount } from 'wagmi'
import { useNewCredential } from '../../context'

export function SubmitButton() {
  const { address } = useAccount()
  const { handleAddCredential, isLoading, error, balance } = useNewCredential()

  return (
    <YStack mt="$4" gap="$2">
      {error && (
        <Text color="$red11" textAlign="center" mt="$-2">
          {error}
        </Text>
      )}
      <Button
        bg="$color12"
        br="$4"
        disabled={!address || isLoading || balance === 0}
        disabledStyle={{ opacity: 0.5, bg: '$color12' }}
        hoverStyle={{ opacity: 0.9, bg: '$color12' }}
        pressStyle={{ opacity: 0.9, bg: '$color12' }}
        onPress={handleAddCredential}
      >
        {!isLoading ? (
          <Text fos="$3" fow="600" color="$color1">
            {address ? 'Add Credential' : 'Connect Wallet'}
          </Text>
        ) : (
          <Spinner color="$color1" />
        )}
      </Button>
    </YStack>
  )
}

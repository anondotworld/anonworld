import { View } from '@anonworld/ui'
import { Dialog } from '@anonworld/ui'
import { useSDK } from '../../providers'
import { AuthActions } from './actions'
import { AuthLogin } from './login'
import { UserCircle } from '@tamagui/lucide-icons'

export function Auth() {
  const { auth } = useSDK()

  if (auth.passkeyId) {
    return <AuthActions passkeyId={auth.passkeyId} />
  }

  return (
    <AuthLogin>
      <Dialog.Trigger asChild>
        <View
          bg="$background"
          br="$12"
          hoverStyle={{ bg: '$color5' }}
          cursor="pointer"
          w={32}
          h={32}
          jc="center"
          ai="center"
        >
          <UserCircle size={20} strokeWidth={2.5} />
        </View>
      </Dialog.Trigger>
    </AuthLogin>
  )
}

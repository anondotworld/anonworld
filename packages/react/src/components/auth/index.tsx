import { useSDK } from '../../providers'
import { AuthActions } from './actions'
import { AuthLogin } from './login'

export function Auth() {
  const { auth } = useSDK()

  if (auth.passkeyId) {
    return <AuthActions passkeyId={auth.passkeyId} />
  }

  return <AuthLogin />
}

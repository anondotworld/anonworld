import {
  ToastProvider as TamaguiToastProvider,
  ToastViewport,
  Toast as TamaguiToast,
  useToastState,
} from '@anonworld/ui'

import { ReactNode } from 'react'

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <TamaguiToastProvider swipeDirection="horizontal" duration={3000}>
      {children}
      <Toast />
      <ToastViewport right={10} bottom={10} />
    </TamaguiToastProvider>
  )
}

const Toast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  return (
    <TamaguiToast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      themeInverse
      backgroundColor="$color12"
      paddingHorizontal="$4"
      paddingVertical="$3"
    >
      <TamaguiToast.Title lineHeight="$1" fontSize="$3" fontWeight="600" color="$color1">
        {currentToast.title}
      </TamaguiToast.Title>
    </TamaguiToast>
  )
}

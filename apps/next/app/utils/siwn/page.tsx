'use client'

import { NeynarAuthButton, NeynarContextProvider, Theme } from '@neynar/react'

export default function SIWN() {
  return (
    <NeynarContextProvider
      settings={{
        clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || '',
        defaultTheme: Theme.Light,
        eventsCallbacks: {
          onAuthSuccess: (data) => {
            console.log(data)
          },
          onSignout() {},
        },
      }}
    >
      <NeynarAuthButton />
    </NeynarContextProvider>
  )
}

'use client'

import ActionComponent from '@/components/action'
import { ConnectButton } from '@/components/connect-button'
import { Logo } from '@/components/logo'
import { CreatePostProvider } from '@/components/create-post/context'
import { useAuth } from '@/lib/context/auth'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isLoaded } = useAuth()
  const [showLoaded, setShowLoaded] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => {
        setShowLoaded(true)
      }, 3000)
    }
  }, [isLoaded])

  if (isLoaded && showLoaded) {
    return <Content />
  }

  return (
    <div className="flex flex-col items-center justify-center grow h-screen bg-[#151515]">
      <img
        src="/anon.png"
        alt="ANON"
        className="w-[88px] h-[88px] rounded-full mb-[88px]"
      />
    </div>
  )
}

function Content() {
  return (
    <CreatePostProvider>
      <div className="flex h-screen flex-col p-4 xl:p-8 max-w-screen-sm mx-auto gap-4">
        <div className="flex items-center justify-between xl:absolute xl:top-0 xl:left-0 xl:right-0 xl:p-8 xl:max-w-screen-xl xl:mx-auto">
          <Logo />
          <ConnectButton />
        </div>
        <div className="z-10 pb-8">
          <ActionComponent variant="post" />
        </div>
      </div>
    </CreatePostProvider>
  )
}

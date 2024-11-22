'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header({ backEnabled, title }: { backEnabled: boolean; title: string }) {
  const router = useRouter()

  const handleBack = () => {
    try {
      router.back()
    } catch (error) {
      window.location.href = '/'
    }
  }

  return (
    <div className="flex flex-row gap-4 items-center">
      {backEnabled && (
        <div onClick={handleBack} className="cursor-pointer" onKeyDown={handleBack}>
          <ArrowLeft />
        </div>
      )}
      <h1 className="font-bold text-lg">{title}</h1>
    </div>
  )
}

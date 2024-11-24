'use client'

export function Logo() {
  const handleClick = () => {
    window.location.href = '/'
  }

  return (
    <div
      className="text-lg font-bold flex flex-row items-center font-geist cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <img src="/anon.webp" alt="ANON" className="w-8 h-8 mr-3 rounded-full" />
      <span className="hidden sm:block">anoncast</span>
    </div>
  )
}

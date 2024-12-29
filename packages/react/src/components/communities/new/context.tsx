import { createContext, useContext, useState } from 'react'

interface NewCommunityContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const NewCommunityContext = createContext<NewCommunityContextValue | null>(null)

export function NewCommunityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <NewCommunityContext.Provider
      value={{
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </NewCommunityContext.Provider>
  )
}

export function useNewCommunity() {
  const context = useContext(NewCommunityContext)
  if (!context) {
    throw new Error('useNewCommunity must be used within a NewCommunityProvider')
  }
  return context
}

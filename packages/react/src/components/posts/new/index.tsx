import { NewPostProvider } from './context'
import { NewPostDialog } from './dialog'

export function NewPost({ onSuccess }: { onSuccess: (hash: string) => void }) {
  return (
    <NewPostProvider onSuccess={onSuccess}>
      <NewPostDialog />
    </NewPostProvider>
  )
}

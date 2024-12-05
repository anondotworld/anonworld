import { CreatePostProvider } from '@/components/create-post/context'
import { Post } from '@/components/post'
import { api } from '@/lib/api'

export default async function Page({ params }: { params: { hash: string } }) {
  const data = await api.getPost(params.hash)

  if (!data) return <div>Cast not found</div>

  return (
    <CreatePostProvider>
      <div className="flex flex-col gap-4">
        <Post cast={data} />
      </div>
    </CreatePostProvider>
  )
}

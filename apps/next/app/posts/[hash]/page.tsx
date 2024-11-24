import { Post } from '@/components/post'
import { api } from '@/lib/api'
import { ANON_ADDRESS } from '@anon/utils/src/config'

export default async function Page({ params }: { params: { hash: string } }) {
  const data = await api.getPost(params.hash)

  if (!data) return <div>Cast not found</div>

  return (
    <div className="flex flex-col gap-4">
      <Post cast={data} tokenAddress={ANON_ADDRESS} />
    </div>
  )
}

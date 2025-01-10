import { Metadata } from 'next'
import { AnonWorldSDK } from '@anonworld/sdk'
import { CommunityPage } from '@/components/community'

const sdk = new AnonWorldSDK()

export async function generateMetadata({
  params,
}: { params: { id: string } }): Promise<Metadata> {
  const community = await sdk.getCommunity(params.id)
  const title = `${community.data?.name} | anon.world`
  const description = community.data?.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`https://anon.world/communities/${params.id}/opengraph-image`],
    },
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const community = await sdk.getCommunity(params.id)

  if (!community.data) {
    return null
  }

  return <CommunityPage community={community.data} />
}

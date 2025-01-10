import { formatHexId, CredentialType, formatAmount } from '@anonworld/common'
import { AnonWorldSDK } from '@anonworld/sdk'
import { PostPage } from '@/components/post'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

const sdk = new AnonWorldSDK()

export async function generateMetadata({
  params,
}: { params: { hash: string } }): Promise<Metadata> {
  const post = await sdk.getPost(params.hash)

  let title = 'anon.world'
  let description = 'An anonymous social network'
  if (post.data) {
    description = post.data.text
    const credential = post.data.credentials?.[0]
    if (credential) {
      const vaultId = credential?.vault_id
      if (vaultId) {
        title = `${formatHexId(vaultId)} | anon.world`
      } else if (credential?.type === CredentialType.ERC20_BALANCE) {
        const amount =
          BigInt(credential.metadata.balance) /
          BigInt(10 ** (credential.token?.decimals ?? 18))
        title = `${formatAmount(Number(amount))} ${credential.token?.symbol} | anon.world`
      } else if (credential?.type === CredentialType.ERC721_BALANCE) {
        title = `${credential.token?.name} Holder | anon.world`
      }
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`https://anon.world/posts/${params.hash}/opengraph-image`],
    },
    other: {
      ['fc:frame']: JSON.stringify({
        version: 'next',
        imageUrl: `https://anon.world/posts/${params.hash}/frame-image`,
        button: {
          title: 'View Post',
          action: {
            type: 'launch_frame',
            name: 'anon.world',
            url: `https://anon.world/posts/${params.hash}`,
            splashImageUrl: 'https://anon.world/logo-background.png',
            splashBackgroundColor: '#000000',
          },
        },
      }),
    },
  }
}

export default async function Page({ params }: { params: { hash: string } }) {
  const post = await sdk.getPost(params.hash)
  if (!post.data) {
    return notFound()
  }
  return <PostPage post={post.data} />
}

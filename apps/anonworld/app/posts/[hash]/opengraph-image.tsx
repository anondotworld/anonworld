import { AnonWorldSDK } from '@anonworld/sdk'
import { ImageResponse } from 'next/og'
import { PostImage } from '@/components/post-image'

const sdk = new AnonWorldSDK()

async function loadFont() {
  const response = await fetch(
    new URL(
      'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap'
    )
  )
  const css = await response.text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (!resource) throw new Error('Failed to load font')

  const fontResponse = await fetch(resource[1])
  return fontResponse.arrayBuffer()
}

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image({ params }: { params: { hash: string } }) {
  const post = await sdk.getPost(params.hash).then((post) => post.data)
  if (!post) return null
  const fontData = await loadFont()

  return new ImageResponse(<PostImage post={post} />, {
    ...size,
    fonts: [
      {
        name: 'Geist',
        data: fontData,
        style: 'normal',
      },
    ],
  })
}

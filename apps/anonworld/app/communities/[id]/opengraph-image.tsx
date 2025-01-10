import { AnonWorldSDK } from '@anonworld/sdk'
import { ImageResponse } from 'next/og'
import { CommunityImage } from '@/components/community-image'

const sdk = new AnonWorldSDK()

async function loadFont(weight: number) {
  const response = await fetch(
    new URL(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&display=swap`)
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

export default async function Image({ params }: { params: { id: string } }) {
  const community = await sdk.getCommunity(params.id).then((community) => community.data)
  if (!community) return null
  const [regular, medium, semibold, bold] = await Promise.all([
    loadFont(400),
    loadFont(500),
    loadFont(600),
    loadFont(700),
  ])
  return new ImageResponse(<CommunityImage community={community} />, {
    ...size,
    fonts: [
      {
        name: 'Geist',
        data: regular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Geist',
        data: medium,
        weight: 500,
        style: 'normal',
      },
      {
        name: 'Geist',
        data: semibold,
        weight: 600,
        style: 'normal',
      },
      {
        name: 'Geist',
        data: bold,
        weight: 700,
        style: 'normal',
      },
    ],
  })
}

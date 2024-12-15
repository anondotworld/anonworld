import { merkleMembership } from '../src'
import { formatHexArray } from './utils'

const signature =
  '0x2d37b16631b67cbe79e8b115cda1ee74dde8492beef9fac0746777c463e0c8cc5cfd2cea5f1e2e6d8899e4fe33ab709a449e262cc9fc56c3d63b789d99270954'
const messageHash = '0x9d447d956f18f06efc4e1fa2b715e6a46fe680d3d35e1ebe90b9d56ad1eddca1'
const pubKeyX = '0x1209769585e7ea6b1d48fb8e7a49ad4a687f3f219c802b167132b3456ad8d2e4'
const pubKeyY = '0x733284ca267f3c5e6fa75bade823fdabd5b4b6a91385d1a6ded76cb55d73611c'
const root = '0x16f60110b4bb93763c78ee8027ea5b25a17d707be4579548985cf90e63ed5e29'
const index = 6120
const path = [
  '0x0000000000000000000000008b80f56a65b63ca6b57230b6b81662100f77eaff',
  '0x0b348372e4472da3b514e554f824b6d637ef8555feda3e9b7d7a3ef2bd919d79',
  '0x1002d430eceed6dbf122bf2a39a705bc3df3a805b41cd81a780b59b268085e8c',
  '0x1c8c082cf3df9bf4a654a3528827f3a51f1a6869f7fce81fe5d28508af8bb229',
  '0x2c152090695fd3ef9c039f1726148e4b2677a75601ecacecbeb6a0516283a681',
  '0x01680f7cd645b0cf36226d3e1c53dd1cbbda5fd1fefdae98787e29a813cd2451',
  '0x2c2a9f3ad71f1ac332951921bdd878f7f9632448200ee849fcf0957609f98ebe',
  '0x1053163671855ddbf2119efd971ea1fc40062de43fc12d1686258279be99788d',
  '0x29bb8eb0894287b4da3fd3b4f8b9df9335802e682cdcafac7610f9cce1b9c4aa',
  '0x178619abcee2d93deaaedddd1892ec20036c0617b3ef0e27df4e6d311a86c43f',
  '0x276320588150af5b861533b94d9badd08e71ad805622b46a5e0d92291e9e4440',
  '0x08ecbb5f7f8d918280cdab0fa68b6acbac5fdab27935982bb47260e38648a4d1',
  '0x0bf2db0394f50216048c7df7a482b31d728d0a7e17a0114228d05387d49598a9',
]

async function main() {
  console.time('generateProof')
  const proofData = await merkleMembership.generate({
    signature: formatHexArray(signature, { length: 64 }),
    message_hash: formatHexArray(messageHash, { length: 32 }),
    pub_key_x: formatHexArray(pubKeyX, { length: 32 }),
    pub_key_y: formatHexArray(pubKeyY, { length: 32 }),
    root,
    index,
    path,
  })
  console.timeEnd('generateProof')
  console.time('verifyProof')
  const verified = await merkleMembership.verify(proofData)
  console.timeEnd('verifyProof')
  console.log({ verified })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))

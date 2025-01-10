import {
  PrivyClient,
  WalletApiEthereumSignTypedDataRpcResponseType,
} from '@privy-io/server-auth'
import { neynar } from './neynar'
import { base, generateIdempotencyKey, idRegistry } from '@anonworld/common'
import { Address } from 'viem'
import { db } from '../db'
import { tokens } from './tokens'

const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!, {
  walletApi: {
    authorizationPrivateKey: process.env.PRIVY_AUTH_KEY,
  },
})

type DeployFarcasterAccountParams = {
  name: string
  description: string
  imageUrl: string
  username: string
}

type DeployTokenParams = {
  name: string
  symbol: string
  imageUrl: string
  creatorAddress: Address
  creatorFid: number
}

type DeployTokenResponse = {
  id: number
  created_at: string
  tx_hash: string
  requestor_fid: number
  contract_address: string
  name: string
  symbol: string
  img_url: string
  pool_address: string
  cast_hash: string
  type: string
  pair: string
}

class ProvisioningService {
  async deployToken(params: DeployTokenParams) {
    const response = await fetch('https://www.clanker.world/api/tokens/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLANKER_API_KEY!,
      },
      body: JSON.stringify({
        name: params.name,
        symbol: params.symbol,
        image: params.imageUrl,
        requestorAddress: params.creatorAddress,
        requestorFid: params.creatorFid.toString(),
        requestKey: generateIdempotencyKey(),
      }),
    })

    const data: DeployTokenResponse = await response.json()

    return await tokens.createNewERC20({
      chainId: base.id,
      address: data.contract_address,
      name: params.name,
      symbol: params.symbol,
      imageUrl: params.imageUrl,
      platform: 'clanker',
    })
  }

  async deployFarcasterAccount(params: DeployFarcasterAccountParams) {
    const { walletId, walletAddress } = await this.deployWallet()

    const { fid } = await neynar.getNewFid()

    const typedData = await idRegistry.getTransferData(fid, walletAddress)

    const signature = (await privy.walletApi.rpc({
      walletId,
      idempotencyKey: generateIdempotencyKey(),
      method: 'eth_signTypedData_v4',
      params: { typedData },
    })) as unknown as WalletApiEthereumSignTypedDataRpcResponseType

    const result = await neynar.createUser({
      fid,
      custodyAddress: walletAddress,
      deadline: Number(typedData.message.deadline),
      signature: signature.data.signature,
      name: params.name,
      description: params.description,
      imageUrl: params.imageUrl,
      username: params.username,
    })

    if (!result.success) {
      throw new Error('Failed to create user')
    }

    await db.socials.createFarcasterAccount({
      fid,
      custody_wallet_id: walletId,
      custody_address: walletAddress,
      signer_uuid: result.signer.signer_uuid,
      metadata: result.user,
    })

    return {
      fid,
      walletId,
      walletAddress,
    }
  }

  async deployWallet() {
    const { id, address } = await privy.walletApi.create({
      chainType: 'ethereum',
    })

    return {
      walletId: id,
      walletAddress: address as Address,
    }
  }
}

export const provisioning = new ProvisioningService()

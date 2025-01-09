import { Address, parseAbiItem } from 'viem'
import { optimism } from './chains'

export class IdRegistry {
  public address: Address = '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b'
  public chain = optimism

  public async getNonce(address: Address) {
    return await this.chain.client.readContract({
      address: this.address,
      abi: this.abi,
      functionName: 'nonces',
      args: [address],
    })
  }

  public async getTransferData(fid: number, custodyAddress: Address) {
    const nonce = await this.getNonce(custodyAddress)
    const deadline = Math.floor(Date.now() / 1000) + 3600

    return {
      domain: this.domain,
      types: this.types,
      primaryType: 'Transfer',
      message: {
        fid: BigInt(fid),
        to: custodyAddress,
        nonce: BigInt(nonce),
        deadline: BigInt(deadline),
      },
    }
  }

  get abi() {
    return [parseAbiItem('function nonces(address) external view returns (uint256)')]
  }

  get domain() {
    return {
      name: 'Farcaster ID Registry',
      version: '1',
      chainId: this.chain.id,
      verifyingContract: this.address,
    }
  }

  get types() {
    return {
      Transfer: [
        { name: 'fid', type: 'uint256' },
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    }
  }
}

export const idRegistry = new IdRegistry()

import web3 from '@solana/web3.js'
import base58 from 'bs58'
import { PRIVATE_KEY } from '../config'

export const getWallet = async () => {
  try {
    let privateKey = PRIVATE_KEY
    if (!privateKey) {
      return null
    }
    const wallet = web3.Keypair.fromSecretKey(base58.decode(privateKey))
    return wallet
  } catch (e) {
    return null
  }
}

import CryptoJS from 'crypto-js'

export const encryptMessage = (message: string, key: string) => {
  const ciphertext = CryptoJS.AES.encrypt(message, key).toString()
  return ciphertext
}

export const decryptMessage = (encryptedMessage: string, key: string) => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key!)
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8)
  return decryptedText
}

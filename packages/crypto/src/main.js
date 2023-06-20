import xxhash from 'xxhash-wasm'
import { customAlphabet } from 'nanoid'

const { h64ToString } = await xxhash()
const nanoId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-', 17)

export const uuid = () => {
  return nanoId()
}

export const checksum = (value) => {
  const string = typeof value !== 'string' ? JSON.stringify(value) : value

  return h64ToString(string)
}

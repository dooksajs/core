import adler from './adler'
import { customAlphabet } from 'nanoid'

const nanoId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-', 17)

export const uuid = () => {
  return nanoId()
}

export const checksum = (value) => {
  const encoder = new TextEncoder()
  const string = typeof value !== 'string' ? JSON.stringify(value) : value
  const buffer = encoder.encode(string)

  return adler(buffer)
}

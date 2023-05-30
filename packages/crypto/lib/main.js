import adler from './adler'
import { v4 as uuidv4 } from 'uuid'

export const uuid = () => {
  const uuid = uuidv4()
  const encoder = new TextEncoder()
  const buffer = encoder.encode(uuid)

  return adler(buffer)
}

export const checksum = (value) => {
  const encoder = new TextEncoder()
  const string = typeof value !== 'string' ? JSON.stringify(value) : value
  const buffer = encoder.encode(string)

  return adler(buffer)
}

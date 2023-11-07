import { xxh64 } from '@node-rs/xxhash'

const SEED = 0xabcdef01

export default (value) => {
  const string = typeof value !== 'string' ? JSON.stringify(value) : value

  return xxh64(string, BigInt(SEED)).toString(16)
}

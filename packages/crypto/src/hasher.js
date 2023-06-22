import xxhash from 'xxhash-wasm'

const { h64ToString } = await xxhash()

export default (value) => {
  const string = typeof value !== 'string' ? JSON.stringify(value) : value

  return h64ToString(string)
}

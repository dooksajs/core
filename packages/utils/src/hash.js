import { xxh64 } from '@pacote/xxhash'

export default {
  hash: null,
  lastHash: null,
  init () {
    if (!this.hash) {
      this.hash = xxh64(6362)
    }
  },
  update (value) {
    if (!this.lastHash) {
      this.hash.reset(6362)
    }

    const string = typeof value !== 'string' ? JSON.stringify(value) : value
    this.lastHash = this.hash.update(string).digest('hex')

    return this.lastHash
  }
}

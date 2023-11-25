import { xxh64 } from '@pacote/xxhash'

export default {
  init () {
    this.hash = xxh64(6362)
  },
  update (value) {
    const string = typeof value !== 'string' ? JSON.stringify(value) : value

    return this.hash.update(string)
  }
}

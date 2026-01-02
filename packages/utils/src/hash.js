import { xxh64 } from '@pacote/xxhash'

export default {
  hash: null,
  lastHash: null,
  /**
   * Initializes the hash object with seed 6362 if it doesn't exist
   * @method
   * @returns {void}
   * @example
   * // Initialize the hash
   * hash.init()
   */
  init () {
    if (!this.hash) {
      this.hash = xxh64(6362)
    }
  },
  /**
   * Updates the hash with the provided value and returns the hex digest
   * @method
   * @param {any} value - The value to hash. Non-string values will be converted to JSON
   * @returns {string} The hex digest of the updated hash
   * @example
   * // Update hash with a string
   * const result = hash.update('hello world')
   * console.log(result) // '3f4e5f6a7b8c9d0e...'
   *
   * // Update hash with an object
   * const result2 = hash.update({ foo: 'bar' })
   * console.log(result2) // 'a1b2c3d4e5f6...'
   */
  update (value) {
    if (!this.lastHash) {
      this.hash.reset(6362)
    }

    const string = typeof value !== 'string' ? JSON.stringify(value) : value
    this.lastHash = this.hash.update(string).digest('hex')

    return this.lastHash
  }
}

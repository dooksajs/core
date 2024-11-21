import hash from './hash.js'

/**
 * Generate a unique id
 * @returns {string}
 */
export default function generateId () {
  const uuid = crypto.randomUUID()

  hash.init()

  return '_' + hash.update(uuid) + '_'
}

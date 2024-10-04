import hash from './hash.js'
import sortObject from './sort-object.js'

/**
 * Create xxhash hash from object
 * @param {Object} source - The original object used to create the hash
 * @returns {string} - xxhash 64 string
 */
function objectHash (source) {
  hash.init()

  const target = sortObject(source)

  if (target === '__proto__' || target === 'constructor' || target === 'prototype') {
    throw new Error('Invalid hash ID')
  }

  return hash.update(target)
}

export default objectHash

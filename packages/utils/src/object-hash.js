import hash from './hash.js'
import sortObject from './sort-object.js'

/**
 * Creates a consistent xxhash64 hash from any JavaScript value
 * @param {any} source - The value to hash (object, array, primitive, etc.)
 * @returns {string} - xxhash64 hex string
 * @throws {Error} - If source is null or undefined
 * @example
 * // Basic objects
 * objectHash({ a: 1, b: 2 }) // returns consistent hash
 *
 * // Arrays
 * objectHash([1, 2, 3]) // hashes sorted array
 *
 * // Primitives
 * objectHash(42) // "42" stringified
 * objectHash("hello") // "hello" directly
 *
 * // Nested structures
 * objectHash({ a: { b: { c: 1 } } })
 */
function objectHash (source) {
  // Handle null and undefined explicitly
  if (source == null) {
    throw new Error('Cannot hash null or undefined value')
  }

  // Initialize hash state
  hash.init()

  // Handle different input types
  let target

  if (Array.isArray(source)) {
    // Arrays: sort them recursively
    target = sortObject(source)
  } else if (typeof source === 'object') {
    // Objects: sort properties recursively
    target = sortObject(source)
  } else {
    // Primitives: use directly (will be stringified by hash.update)
    target = source
  }

  // Compute and return hash
  return hash.update(target)
}

export default objectHash

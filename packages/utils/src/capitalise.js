/**
 * Capitalizes the first letter of a string while keeping the rest unchanged.
 *
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 * @throws {TypeError} If the input is not a string
 * @throws {Error} If the input is an empty string
 *
 * @example
 * // Basic usage
 * capitalize('hello') // returns 'Hello'
 * capitalize('world') // returns 'World'
 *
 * @example
 * // With already capitalized strings
 * capitalize('Hello') // returns 'Hello'
 *
 * @example
 * // With multiple words (only first character is capitalized)
 * capitalize('hello world') // returns 'Hello world'
 *
 * @example
 * // With Unicode characters
 * capitalize('ñoño') // returns 'Ñoño'
 * capitalize('über') // returns 'Über'
 *
 * @example
 * // Error cases
 * capitalize('') // throws Error
 * capitalize(null) // throws TypeError
 * capitalize(123) // throws TypeError
 */
export default function capitalize (string) {
  // Input validation
  if (typeof string !== 'string') {
    throw new TypeError(`Expected string, got ${typeof string}`)
  }

  if (string.length === 0) {
    throw new Error('Cannot capitalize empty string')
  }

  // Capitalize first letter and preserve the rest
  return string[0].toUpperCase() + string.slice(1)
}

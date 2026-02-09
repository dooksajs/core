/**
 * Capitalizes the first letter of a string while keeping the rest unchanged.
 *
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 * @throws {TypeError} If the input is not a string
 * @throws {Error} If the input is an empty string
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

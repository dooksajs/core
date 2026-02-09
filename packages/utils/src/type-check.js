/**
 * Checks if the value is a plain object
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is a plain object
 */
export function isObject (value) {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

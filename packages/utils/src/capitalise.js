/**
 * Uppercase first letter
 * @param {string} string
 */
export default function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}

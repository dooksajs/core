/**
 * Generate a unique id
 * @returns {string}
 */
export default function generateId () {
  const uuid = crypto.randomUUID()
  return '_' + uuid.substring(0, 8) + 'a' + uuid.substring(9, 13) + 'a' + uuid.substring(14, 16) + '_'
}

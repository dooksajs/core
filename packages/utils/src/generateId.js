import { customAlphabet } from 'nanoid'

const uuid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-', 16)


/**
 * Generate a unique id
 * @returns {string}
 */
export default function generateId () {
  return '_' + uuid() + '_'
}

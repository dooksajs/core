import { readFileSync } from 'fs'

// HTML regex extension
const htmlRegex = /\.html$/

/**
 * Vite plugin html loader
 * @returns {Object}
 */
export default function dstPlugin () {
  return {
    name: 'ds-html-loader',
    /**
     * Transform hook
     * @param {string} code
     * @param {string} id - Filepath
     * @returns {string} HTML string
     */
    async transform (code, id) {
      if (htmlRegex.test(id)) {
        const htmlRAW = readFileSync(id, 'utf8')

        return {
          code: `export default \`${htmlRAW}\``
        }
      }
    }
  }
}

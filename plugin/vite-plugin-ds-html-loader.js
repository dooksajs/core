import { readFileSync } from 'fs'

const htmlRegex = /\.html$/

export default function dstPlugin () {
  return {
    name: 'ds-html-loader',
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

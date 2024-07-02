import createPlugin from '@dooksa/create-plugin'
import { existsSync } from 'node:fs'
import { $setDataValue } from '@dooksa/plugins'
import compileSass from '@dooksa/theme'

const theme = createPlugin('theme', {
  models: {
    styles: {
      type: 'string'
    }
  },
  actions: {
    compileSass
  },
  /**
   * @param {Object} param
   * @param {string} [param.path='']
   */
  setup ({ path = '' } = {}) {
    if (path) {
      if (!existsSync(path)) {
        throw new Error('Custom sass directory does not exist: ' + path)
      }
    }

    const result = compileSass(path)

    $setDataValue('page/css', result.css)
  }
})

const themeCompile = compileSass

export {
  themeCompile
}

export default theme

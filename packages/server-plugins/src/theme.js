import { createPlugin } from '@dooksa/create'
import { existsSync } from 'node:fs'
import { $setDataValue } from '@dooksa/plugins'
import compileSass from '@dooksa/theme'

const theme = createPlugin({
  name: 'theme',
  models: {
    styles: {
      type: 'string'
    }
  },
  actions: {
    compileSass
  },
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

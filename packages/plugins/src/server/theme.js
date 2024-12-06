import { createPlugin } from '@dooksa/create-plugin'
import { existsSync } from 'node:fs'
import { dataSetValue } from '../client/index.js'
import compileSass from '@dooksa/theme'

export const theme = createPlugin('theme', {
  schema: {
    styles: {
      type: 'string'
    }
  },
  methods: {
    compile: compileSass
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

    dataSetValue({
      name: 'page/css',
      value: result.css
    })
  }
})

export const { themeCompile } = theme
export default theme

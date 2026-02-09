import { createPlugin } from '@dooksa/create-plugin'
import { existsSync } from 'node:fs'
import { stateSetValue } from '#core'
import compileSass from '@dooksa/theme'

export const theme = createPlugin('theme', {
  state: {
    schema: {
      styles: {
        type: 'string'
      }
    }
  },
  methods: {
    compile: compileSass
  },
  /**
   * @param {Object} param - Setup parameters
   * @param {string} [param.path=''] - Path to custom sass directory
   */
  setup ({ path = '' } = {}) {
    if (path) {
      if (!existsSync(path)) {
        throw new Error('Custom sass directory does not exist: ' + path)
      }
    }

    const result = compileSass(path)

    stateSetValue({
      name: 'page/css',
      value: result.css
    })
  }
})

export const { themeCompile } = theme
export default theme

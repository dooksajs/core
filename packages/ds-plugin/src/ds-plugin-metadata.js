import { definePlugin } from '@dooksa/utils'

/**
 * Ds Plugin.
 * @namespace dsMetadata
 */
export default definePlugin({
  name: 'dsMetadata',
  version: 1,
  data: {
    language: {
      default: () => 'en',
      schema: {
        type: 'string'
      }
    },
    availableLanguages: {
      default: ['en'],
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  },
  setup ({ defaultLanguage, availableLanguages } = {}) {
    if (defaultLanguage) {
      this.$setDataValue('dsMetadata/language', defaultLanguage)
    }

    if (availableLanguages) {
      this.$setDataValue('dsMetadata/languages', availableLanguages)
    }
  }
})

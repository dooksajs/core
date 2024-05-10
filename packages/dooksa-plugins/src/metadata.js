import { createPlugin } from '@dooksa/create'
import { $setDataValue } from './data.js'

export default createPlugin({
  name: 'metadata',
  data: {
    language: {
      type: 'string'
    },
    availableLanguages: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  setup ({ defaultLanguage = 'en', availableLanguages = ['en'] } = {}) {
    $setDataValue('metadata/language', defaultLanguage)
    $setDataValue('metadata/availableLanguages', availableLanguages)
  }
})

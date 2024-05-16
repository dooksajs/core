import { createPlugin } from '@dooksa/create'
import { $setDataValue } from './data.js'

export default createPlugin({
  name: 'metadata',
  models: {
    currentLanguage: {
      type: 'string'
    },
    languages: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  setup ({ currentLanguage = 'en', languages = ['en'] } = {}) {
    $setDataValue('metadata/currentLanguage', currentLanguage)
    $setDataValue('metadata/languages', languages)
  }
})

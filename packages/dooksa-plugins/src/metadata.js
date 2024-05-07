import { createPlugin } from '@dooksa/create'

export default createPlugin('metadata', ({ defineData, defineSetup }, { $setDataValue }) => {
  defineData({
    language: {
      default: () => 'en',
      schema: {
        type: 'string'
      }
    },
    availableLanguages: {
      default: () => ['en'],
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  })

  defineSetup(({ defaultLanguage = '', availableLanguages = [] }) => {
    if (defaultLanguage) {
      $setDataValue('metadata/language', defaultLanguage)
    }

    if (availableLanguages.length) {
      $setDataValue('metadata/availableLanguages', availableLanguages)
    }
  })
})

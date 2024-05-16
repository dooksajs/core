import { createPlugin } from '@dooksa/create'
import { $getDataValue } from './data.js'

export default createPlugin({
  name: 'content',
  models: {
    items: {
      type: 'collection',
      suffixId () {
        return $getDataValue('metadata/currentLanguage').item
      },
      items: {
        type: 'object'
      }
    }
  }
})

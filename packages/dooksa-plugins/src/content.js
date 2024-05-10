import { createPlugin } from '@dooksa/create'
import { $getDataValue } from './data.js'

export default createPlugin({
  name: 'content',
  data: {
    items: {
      type: 'collection',
      suffixId () {
        return $getDataValue('dsMetadata/language').item
      },
      items: {
        type: 'object'
      }
    }
  }
})

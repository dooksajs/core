import { createPlugin } from '@dooksa/create'
import { $getDataValue } from './data.js'

export default createPlugin('content', ({ context, defineData }, { $getDataValue }) => {
  defineData({
    items: {
      schema: {
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
})

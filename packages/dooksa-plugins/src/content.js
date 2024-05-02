import { createPlugin } from '@dooksa/create-plugin'

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

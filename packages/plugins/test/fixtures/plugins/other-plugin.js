import createPlugin from '@dooksa/create-plugin'

export default createPlugin('other', {
  state: {
    schema: {
      collection: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      }
    }
  }
})

import createPlugin from '@dooksa/create-plugin'

const otherPlugin = createPlugin('other', {
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

export { otherPlugin }
export default otherPlugin

import createPlugin from '@dooksa/create-plugin'

const specialPlugin = createPlugin('special', {
  state: {
    schema: {
      'c_at_ll-ect_ion': {
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

export { specialPlugin }

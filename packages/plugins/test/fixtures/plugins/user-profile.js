import createPlugin from '@dooksa/create-plugin'

const userPlugin = createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            settings: {
              type: 'string',
              relation: 'user/settings'
            }
          }
        }
      },
      settings: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            theme: { type: 'string' }
          }
        }
      }
    }
  }
})

export { userPlugin }
export default userPlugin

/**
 * Ds Plugin.
 * @module plugin
 */
export default {
  name: 'dsMetadata',
  version: 1,
  data: {
    appId: {
      default: '',
      schema: {
        type: 'string'
      }
    },
    language: {
      default: 'en',
      schema: {
        type: 'string'
      }
    },
    languages: {
      default: ['en'],
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    theme: {
      default: '',
      schema: {
        type: 'string'
      }
    }
  }
}

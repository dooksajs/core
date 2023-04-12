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
      default: 'default',
      schema: {
        type: 'string'
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

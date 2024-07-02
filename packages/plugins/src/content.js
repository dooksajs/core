import createPlugin from '@dooksa/create-plugin'
import { $getDataValue } from './data.js'

const content = createPlugin('content', {
  metadata: {
    plugin: {
      title: 'Content',
      description: 'Manage content',
      icon: 'mdi:text'
    }
  },
  models: {
    items: {
      type: 'collection',
      suffixId () {
        return $getDataValue('metadata/currentLanguage').item
      },
      items: {
        type: 'object'
      }
    },
    components: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'component/items',
          uniqueItems: true
        }
      }
    },
    languages: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'content/items',
          uniqueItems: true
        }
      }
    }
  }
})

export { content }

export default content


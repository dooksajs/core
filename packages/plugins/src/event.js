import createPlugin from '@dooksa/create-plugin'
import { actionDispatch, $getDataValue } from './index.js'

const event = createPlugin('event', {
  metadata: {
    plugin: {
      title: 'Event',
      description: 'Event manager',
      icon: 'mdi:fire'
    }
  },
  models: {
    listeners: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'action/items'
        }
      }
    },
    handlers: {
      type: 'collection',
      uniqueItems: true,
      items: {
        type: 'array'
      }
    }
  },
  actions: {
    /**
     * Emit event
     * @param {string} name - Name of event
     * @param {Object} param
     * @param {string} param.id - Event id is the listener reference item
     * @param {Object} [param.context] - The action that runs on the event
     * @param {Object} [param.payload] - The action that runs on the event
     */
    $emit (name, { id, context, payload }) {
      const listeners = $getDataValue('event/listeners', {
        id,
        suffixId: name
      })

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.item.length; i++) {
          actionDispatch({
            id: listeners.item[i],
            context,
            payload
          })
        }
      }
    }
  }
})

const $emit = event.actions.$emit

export { event, $emit }

export default event

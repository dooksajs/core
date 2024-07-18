import createPlugin from '@dooksa/create-plugin'
import { actionDispatch, dataGetValue } from './index.js'

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
     * @param {Object} param
     * @param {string} param.name - Name of event
     * @param {string} param.id - Event id is the listener reference item
     * @param {Object} [param.context] - The action that runs on the event
     * @param {Object} [param.payload] - The action that runs on the event
     */
    emit ({ name, id, context, payload }) {
      const listeners = dataGetValue({
        name: 'event/listeners',
        id,
        prefixId: name
      })

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.item.length; i++) {
          actionDispatch({
            id: listeners.item[i],
            context,
            payload,
            clearBlockValues: true
          })
        }
      }
    }
  }
})

const eventEmit = event.actions.emit

export { event, eventEmit }

export default event

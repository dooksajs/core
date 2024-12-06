import { createPlugin } from '@dooksa/create-plugin'
import { actionDispatch, dataGetValue } from './index.js'

/**
 * @typedef {Object} EventEmit
 * @property {string} name - Name of event
 * @property {string} id - Event id is the listener reference item
 * @property {Object} [context] - The action that runs on the event
 * @property {Object} [payload] - The action that runs on the event
 */

export const event = createPlugin('event', {
  metadata: {
    title: 'Event',
    description: 'Event manager',
    icon: 'mdi:fire'
  },
  schema: {
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
      items: { type: 'array' }
    }
  },
  methods: {
    /**
     * Emit event
     * @param {EventEmit} param
     */
    emit ({ name, id, context, payload }) {
      const listeners = dataGetValue({
        name: 'event/listeners',
        id,
        prefixId: name
      })
      const eventPromises = []

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.item.length; i++) {
          eventPromises.push(
            actionDispatch({
              id: listeners.item[i],
              context,
              payload,
              clearBlockValues: true
            })
          )
        }
      }

      return eventPromises
    }
  }
})

export const {
  eventEmit
} = event

export default event

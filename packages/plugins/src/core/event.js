import { createPlugin } from '@dooksa/create-plugin'
import { actionDispatch, stateGetValue } from '#core'

/**
 * @import {EventEmit} from '@dooksa/types'
 */

export const event = createPlugin('event', {
  metadata: {
    title: 'Event',
    description: 'Event manager',
    icon: 'mdi:fire'
  },
  state: {
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
    }
  },
  methods: {
    /**
     * Emit an event and trigger all registered listeners
     * @param {Object} param - Event emission parameters
     * @param {string} param.name - Name of the event to emit
     * @param {string} param.id - Event listener reference item ID
     * @param {Object} [param.context] - Context object containing data available to action handlers
     * @param {Object} [param.payload] - Data payload to pass to event handlers
     * @returns {Promise[]} Array of promises from action dispatches for all event listeners
     */
    emit ({ name, id, context, payload }) {
      const listeners = stateGetValue({
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

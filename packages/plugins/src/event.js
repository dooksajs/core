import { createPlugin } from '@dooksa/create'
import { actionDispatch, $getDataValue } from './index.js'

const event = createPlugin({
  name: 'event',
  data: {
    listeners: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'dsAction/items'
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
     * @param {dsEventId} param.id - Event id is the listener reference item
     * @param {dsEventOn} param.on - Event fired "on" an event name
     * @param {Object.<string, any>} param.payload - The action that runs on the event
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

export { $emit }

export default event

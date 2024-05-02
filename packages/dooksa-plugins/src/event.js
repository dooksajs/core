import { createPlugin } from '@dooksa/create-plugin'
import { action } from './index.js'

export default createPlugin('event', ({ context, defineData, defineContextProperties }, { $getDataValue }) => {
  defineData({
    listeners: {
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsAction/items'
          }
        }
      }
    },
    handlers: {
      schema: {
        type: 'collection',
        uniqueItems: true,
        items: {
          type: 'array'
        }
      }
    }
  })

  defineContextProperties({
    /**
     * Emit event
     * @param {Object} param
     * @param {dsEventId} param.id - Event id is the listener reference item
     * @param {dsEventOn} param.on - Event fired "on" an event name
     * @param {Object.<string, any>} param.payload - The action that runs on the event
     */
    $emit (name, { id, context, payload }) {
      const listeners = $getDataValue('dsEvent/listeners', {
        id,
        suffixId: name
      })

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.item.length; i++) {
          action.dispatch({
            id: listeners.item[i],
            context,
            payload
          })
        }
      }
    }
  })
})

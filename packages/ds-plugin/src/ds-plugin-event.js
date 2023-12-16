import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {string} dsEventId - Event id is the listener reference item
 */

/**
 * @typedef {string} dsEventOn - Event fired "on" an event name
 */

/**
 * Dooksa event plugin.
 * @namespace dsEvent
 */
export default definePlugin({
  name: 'dsEvent',
  version: 1,
  data: {
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
    }
  },
  /** @lends dsEvent */
  methods: {
    /**
     * Emit event
     * @param {Object} param
     * @param {dsEventId} param.id - Event id is the listener reference item
     * @param {dsEventOn} param.on - Event fired "on" an event name
     * @param {Object.<string, any>} param.payload - The action that runs on the event
     */
    $emit (name, { id, payload }) {
      const listeners = this.$getDataValue('dsEvent/listeners', {
        id,
        suffixId: name
      })

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.item.length; i++) {
          this.$method('dsAction/dispatch', {
            id: listeners.item[i],
            payload
          })
        }
      }
    }
  }
})

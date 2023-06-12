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
export default {
  name: 'dsEvent',
  version: 1,
  data: {
    listeners: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsAction/sequenceActions'
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
    emit (name, { id, payload }) {
      const listeners = this.$getDataValue('dsEvent/listeners', {
        id: id + '_' + name
      })

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.item.length; i++) {
          this.$method('dsAction/dispatch', {
            dsActionId: listeners.item[i],
            payload
          })
        }
      }
    }
  }
}

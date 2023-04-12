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
    emit ({ id, on, payload }) {
      const listeners = this.$getDataValue({
        name: 'dsEvent/listeners',
        id: id + '_' + on
      })

      if (!listeners.isEmpty) {
        for (let i = 0; i < listeners.value.length; i++) {
          this.$method('dsAction/dispatch', {
            dsActionId: listeners.value[i],
            payload
          })
        }
      }
    },
    /**
     * Remove listener
     * @param {Object} param
     * @param {dsActionId} param.dsActionId - The action that runs on the event
     */
    removeListener ({ dsEventId, dsEventOn, dsActionId }) {
      const id = this._id(dsEventId, dsEventOn)
      const listeners = this._getListener(id)

      if (listeners.length) {
        const list = []

        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i] !== dsActionId) {
            list.push(listeners[i])
          }
        }

        if (!list.length) {
          delete this.listeners[id]
        } else {
          this.listeners[id] = list
        }
      }
    }
  }
}

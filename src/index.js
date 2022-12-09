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
  dependencies: [
    {
      name: 'dsAction',
      version: 1
    }
  ],
  data: {
    listeners: {}
  },
  /** @lends dsEvent */
  methods: {
    /**
     * Add listener
     * @param {Object} param
     * @param {dsEventId} param.dsEventId - Event id is the listener reference item
     * @param {dsEventOn} param.dsEventOn - Event fired "on" an event name
     * @param {dsActionId} param.dsActionId - The action that runs on the event
     */
    addListener ({ dsEventId, dsEventOn, dsActionId }) {
      const id = this._id(dsEventId, dsEventOn)

      if (this.listeners[id]) {
        this.listeners[id].push(dsActionId)
      } else {
        this.listeners[id] = [dsActionId]
      }
    },
    /**
     * Emit event
     * @param {Object} param
     * @param {dsEventId} param.dsEventId - Event id is the listener reference item
     * @param {dsEventOn} param.dsEventOn - Event fired "on" an event name
     * @param {Object.<string, any>} param.payload - The action that runs on the event
     */
    emit ({ dsEventId, dsEventOn, payload }) {
      const id = this._id(dsEventId, dsEventOn)
      const listeners = this._getListener(id)

      for (let i = 0; i < listeners.length; i++) {
        const dsActionId = listeners[i]

        this.$method('dsAction/dispatch', { dsActionId, payload })
      }
    },
    /**
     * Remove listener
     * @param {Object} param
     * @param {dsEventIYou cannot open the zip file directly in vscode, itnId} param.dsActionId - The action that runs on the event
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
    },
    /**
     * Set listeners
     * @param {Object} listener
     */
    set (listener) {
      this.listeners = { ...this.listeners, ...listener }
    },
    _getListener (dsEventId) {
      return this.listeners[dsEventId] ?? []
    },
    _id (id, on) {
      return id + '_' + on
    }
  }
}

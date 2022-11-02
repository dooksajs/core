/**
 * Dooksa event plugin.
 * @module plugin
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
    items: {}
  },
  methods: {
    addListener (context, { id, on, action }) {
      if (this.items[id]) {
        if (this.items[id][on]) {
          this.items[id][on].push(action)
        } else {
          this.items[id][on] = [action]
        }
      } else {
        this.items[id] = {
          [on]: [action]
        }
      }
    },
    emit (context, { id, on, payload }) {
      // not sure why we need the context name
      // const eventName = this._name(context.name, on)
      const listeners = this.getListener({}, { id, on })

      for (let i = 0; i < listeners.length; i++) {
        this.$method('dsAction/dispatch', { sequenceId: listeners[i], payload })
      }
    },
    removeListener (context, { id, on, value }) {
      if (this.items[id]) {
        if (this.items[id][on]) {
          const items = this.items[id][on]
          const list = []

          for (let i = 0; i < items.length; i++) {
            if (items[i] !== value) {
              list.push(items[i])
            }
          }

          if (!list.length) {
            delete this.items[id][on]
          } else {
            this.items[id][on] = list
          }
        }
      }
    },
    getListener (context, { id, on }) {
      if (this.items[id]) {
        return this.items[id][on] ? this.items[id][on] : []
      }

      return []
    },
    _name (contextName, name) {
      return contextName + '/' + name
    }
  }
}

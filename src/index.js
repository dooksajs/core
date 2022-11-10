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
    handlers: {},
    items: {}
  },
  methods: {
    addListener ({ id, on, action }) {
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
    emit ({ id, on, payload }) {
      // not sure why we need the context name
      // const eventName = this._name(context.name, on)
      const listeners = this.getListener({ id, on })

      for (let i = 0; i < listeners.length; i++) {
        this.$method('dsAction/dispatch', { sequenceId: listeners[i], payload })
      }
    },
    removeListener ({ id, on, value }) {
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
    getListener ({ id, on }) {
      if (this.items[id]) {
        return this.items[id][on] ? this.items[id][on] : []
      }

      return []
    },
    getHandler (id) {
      return this.handler[id]
    },
    addHandler (id, callback) {
      this.handler[id] = callback
    },
    removeHandler (id) {
      delete this.handler[id]
    },
    set (item) {
      this.items = { ...this.items, ...item }
    },
    _name (contextName, name) {
      return contextName + '/' + name
    }
  }
}

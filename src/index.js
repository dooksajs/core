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
    addListener (context, { id, name, item }) {
      if (this.items[id]) {
        if (this.items[id][name]) {
          this.items[id][name].push(item)
        } else {
          this.items[id][name] = [item]
        }
      } else {
        this.items[id] = {
          [name]: [item]
        }
      }
    },
    emit (context, { id, name, payload }) {
      const eventName = this._name(context.name, name)
      const listeners = this._getListener(id, eventName)

      for (let i = 0; i < listeners.length; i++) {
        this.$method('dsAction/dispatch', { id: listeners[i], data: payload })
      }
    },
    removeListener (context, { id, name, value }) {
      if (this.items[id]) {
        if (this.items[id][name]) {
          const items = this.items[id][name]
          const list = []

          for (let i = 0; i < items.length; i++) {
            if (items[i] !== value) {
              list.push(items[i])
            }
          }

          if (!list.length) {
            delete this.items[id][name]
          } else {
            this.items[id][name] = list
          }
        }
      }
    },
    _getListener (id, name) {
      if (this.items[id]) {
        return this.items[id][name] ? [...this.items[id][name]] : []
      }

      return []
    },
    _name (contextName, name) {
      return contextName + '/' + name
    }
  }
}

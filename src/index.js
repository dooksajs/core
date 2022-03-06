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
    addListener (context, { id, name, payload }) {
      if (this.items[id]) {
        if (this.items[id][name]) {
          this.items[id][name].push(payload)
        } else {
          this.items[id][name] = [payload]
        }
      } else {
        this.items[id] = {
          [name]: [payload]
        }
      }
    },
    emit (context, { id, name, payload }) {
      const actions = this._listener(id, context.name + '/' + name)

      for (let i = 0; i < actions.length; i++) {
        this.$action('dsAction/dispatch', { id: actions[i], data: payload })
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
    _listener (id, name) {
      if (this.items[id]) {
        return this.items[id][name] ? [...this.items[id][name]] : []
      }

      return []
    }
  }
}

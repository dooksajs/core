/**
 * Ds Plugin.
 * @module plugin
 */
export default {
  name: 'dsDevTool',
  version: 1,
  data: {
    items: {
      private: true,
      default: {}
    },
    plugins: {
      private: true,
      default: []
    },
    keys: {
      private: true,
      default: {}
    }
  },
  methods: {
    /**
     * @param {Object} _context - This is the flattened object used within a plugin
     * @param {Object} plugin - This is the original plugin object
     */
    set ({ _context, plugin }) {
      this.items[plugin.name] = _context
      this.plugins.push(plugin.name)

      if (plugin.data) {
        this.keys[plugin.name + '/data'] = this._createKeys(plugin.data)
      }

      if (plugin.methods) {
        this.keys[plugin.name + '/methods'] = this._createKeys(plugin.data)
      }
    },
    getPlugins () {
      return this.plugins
    },
    getData (name) {
      const dataKeys = this.keys[name + '/data'] || []
      const results = {
        name,
        version: this.items[name].version
      }

      for (let i = 0; i < dataKeys.length; i++) {
        const key = dataKeys[i]

        results[key] = this.items[name][key]
      }

      return results
    },
    getAll (name) {
      return this.items[name]
    },
    getItem ({ name, id }) {
      if (this.items[name] && this.items[name][id]) {
        return this.items[name][id]
      }
    },
    /**
     * @param {*} params - Params are the parameters used for this method
     */
    _createKeys (data) {
      const keys = []

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          keys.push(key)
        }
      }

      return keys
    }
  }
}

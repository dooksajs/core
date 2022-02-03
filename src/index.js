import { name, version } from '../ds.plugin.config'

/**
 * Dooksa action plugin.
 * @module plugin
 */
export default {
  name,
  version,
  dependencies: [
    {
      name: 'dsParameters',
      version: 1
    }
  ],
  data: {
    items: {},
    conditions: {}
    lastActionIndex: {}
  },
  methods: {
    dispatch ({
      root,
      instanceId,
      parentItemId,
      actions = [],
      conditions = [],
      data,
      results = {}
    }) {
      let lastItem = false
      let valid = true
      let hasCallback = false

      if (root) {
        instanceId = nanoid()
        this.lastActionIndex[instanceId] = actions.length - 1
      }

      if (conditions.length) {
        valid = this._compare(conditions, { instanceId: nanoid(), parentItemId, data })
      }

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        const itemId = action.itemId
        const item = action.items[itemId]

        if (item.conditions) {
          valid = this._compare(item.conditions, { instanceId: nanoid(), parentItemId, data })
        }

        if (Object.hasOwnProperty.call(item, 'when') && valid !== item.when) {
          return
        }

        // Check if item has a literal value
        if (Object.hasOwnProperty.call(item, 'value')) {
          return [item.value]
        }

        const callback = {
          onSuccess: null,
          onError: null
        }
        // TODO: [DS-561] make sure onSuccess value exists to avoid complex condition
        if (Array.isArray(item.onSuccess) && item.onSuccess.length) {
          hasCallback = true

          callback.onSuccess = {
            params: {
              id,
              parentItemId: itemId,
              actions: this._createActions(item.onSuccess, action),
              data
            },
            method: this.rules.bind(this)
          }
        }

        // TODO: [DS-562] make sure onError value exists to avoid complex condition
        if (Array.isArray(item.onError) && item.onSuccess.length) {
          hasCallback = true

          callback.onError = {
            params: {
              id: instanceId,
              parentItemId: itemId,
              actions: this._createActions(item.onError, action),
              data
            },
            method: this.rules.bind(this)
          }
        }

        // Check if this action is the last item
        if (i === this.lastActionIndex[id] && !hasCallback) {
          lastItem = true
          delete this.lastActionIndex[id]
        }

        const result = this._action({
          id,
          itemId,
          items: action.items,
          conditions: action.conditions,
          parentItemId,
          ...item,
          callback,
          data,
          results,
          lastItem
        })

        if (result) {
          results[itemId] = result
        }
      }

      return results
    },
    _createActions (items, action) {
      const actions = []

      for (let i = 0; i < items.length; i++) {
        actions.push({
          itemId: items[i],
          items: action.items,
          params: action.params
        })
      }

      return actions
    },
    _action ({
      id,
      name,
      type,
      computedParams,
      paramType,
      paramItems,
      params,
      data,
      results,
      callback = {},
      itemId,
      parentItemId,
      lastItem
    }) {
      if (computedParams) {
        params = this.$method('dsParameters/process', {
          id,
          itemId,
          parentItemId,
          paramType,
          params,
          paramItems,
          data,
          results,
          lastItem
        })
      }

      return this['_' + type]({ name, params, callback })
    },
    /**
     * This callback is used after a rule
     * @callback onEventCallback
     */

    /**
     * Runs onError callback
     * @param {onEventCallback} callback - This callback is expected to be a rule or another function within the workflow scope
     * @param {Object} params - An object that are params for the rules callback
     * @param {*} result - The result from the parent function to pass onto the callback
     */
    _onError (callback, params, result) {
      let callbackParams = result

      if (params) {
        callbackParams = { ...params, result }
      }

      callback(callbackParams)
    },
    /**
     * Runs onSuccess callback
     * @param {onEventCallback} callback - This callback is expected to be a rule or another function within the workflow scope
     * @param {Object} params - An object that are params for the rules callback
     * @param {*} results - The results from the parent function to pass onto the callback
     */
    _onSuccess (callback, params, results) {
      let callbackParams = results

      if (params) {
        callbackParams = { ...params, results }
      }

      callback(callbackParams)
    },
    _compare (conditions, { instanceId, parentItemId, data }) {
      let result = false
      let hasLogicalOperator = false
      let results = []

      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i]
        const operator = condition.name

        if (operator === '&&' || operator === '||') {
          results = [...results, operator]
          hasLogicalOperator = true
        } else {
          const values = []
          const length = condition.values.length - 1

          for (let i = 0; i < condition.values.length; i++) {
            const item = condition.values[i]
            let value = item.value

            if (Object.hasOwnProperty.call(item, 'itemId')) {
              value = this._action({
                instanceId,
                itemId: item.itemId,
                parentItemId,
                paramItems: condition.params,
                data,
                lastItem: length === i,
                ...condition.items[item.itemId]
              })
            }

            values.push(value)
          }

          const compareResults = this.$method('dsOperators/eval', { name: operator, values })

          results.push(compareResults)
        }
      }

      if (hasLogicalOperator) {
        result = this.$method('dsOperators/compare', results)
      } else {
        for (let i = 0; i < results.length; i++) {
          result = true

          if (!results[i]) {
            result = false
            break
          }
        }
      }

      return result
    },
    _getProcessValue ({ params, callback }) {
      const onSuccess = callback.onSuccess
      const onError = callback.onError
      const results = params

      if (onSuccess) {
        this._onSuccess(onSuccess.method || onSuccess, onSuccess.params, results)
      }

      if (onError) {
        this._onError(onError.method || onError, onError.params)
      }

      return results
    },
    _getter ({ name, params, callback }) {
      const onSuccess = callback.onSuccess
      const onError = callback.onError
      let results

      if (typeof this.$context.store.getters[name] === 'function') {
        results = this.$context.store.getters[name](params)
      } else {
        results = this.$context.store.getters[name]
      }

      if (results) {
        if (onSuccess) {
          this._onSuccess(onSuccess.method || onSuccess, onSuccess.params, results)
        }
      }

      if (onError) {
        if (onError) {
          this._onError(onError.method || onError, onError.params)
        }
      }

      return results
    },
    _pluginAction ({ name, params, callback }) {
      this.$action(name, params, callback)
    },
    _pluginMethod ({ name, params, callback }) {
      const onSuccess = callback.onSuccess
      const results = this.$method(name, params)

      if (onSuccess) {
        this._onSuccess(onSuccess.method || onSuccess, onSuccess.params, results)
      }
    }
  }
}

/**
 * Dooksa action plugin.
 * @module plugin
 */
export default {
  name: 'dsAction',
  version: 1,
  dependencies: [
    {
      name: 'dsParameters',
      version: 1
    }
  ],
  data: {
    actions: {},
    sequence: {},
    conditions: {}
  },
  methods: {
    dispatch (context, { sequenceId, payload }) {
      const sequence = this.sequence[sequenceId]

      if (!sequence) return

      this._dispatch({
        sequenceId,
        actions: sequence.actions,
        conditions: sequence.conditions || {},
        payload
      })
    },
    _getEntryId (item) {
      return item.entry.map(key => item[key])
    },
    set (context, { actions, conditions, sequence }) {
      if (actions) {
        this.actions = { ...this.actions, ...actions }
      }

      if (conditions) {
        this.conditions = { ...this.conditions, ...conditions }
      }

      if (sequence) {
        this.sequence[sequence.id] = {
          actions: sequence.actions
        }

        if (sequence.conditions) {
          this.sequence[sequence.id].conditions = sequence.conditions
        }
      }
    },
    setConditions (context, item) {
      this.conditions = { ...this.conditions, ...item }
    },
    _dispatch ({
      sequenceId,
      instance = {
        iteration: {},
        results: {}
      },
      parentEntry,
      actions = {},
      conditions = {},
      payload,
      results = {}
    }) {
      let valid = true

      instance.payload = payload

      if (parentEntry) {
        instance.results[parentEntry] = results
      }

      if (conditions.length) {
        valid = this._compare(conditions, {
          parentEntry,
          instance
        })
      }

      for (let i = 0; i < actions.entry.length; i++) {
        const entry = actions.entry[i]
        const item = actions[entry]
        let action = item

        if (item._$id) {
          action = this.actions[item._$id]
        }

        if (item.conditions) {
          valid = this._compare(item.conditions, {
            parentEntry,
            instance
          })
        }

        if (Object.hasOwnProperty.call(action, 'when') && valid !== action.when) {
          return
        }

        // Check if item has a literal value
        if (Object.hasOwnProperty.call(action, 'value')) {
          return [action.value]
        }

        const callback = {
          onSuccess: null,
          onError: null
        }

        // Setup onSuccess callback
        if (Object.hasOwnProperty.call(item, 'onSuccess')) {
          callback.onSuccess = {
            params: {
              parentEntry: entry,
              actions: {
                entry: item.onSuccess,
                ...actions
              },
              instance
            },
            method: this._dispatch.bind(this)
          }
        }

        // Setup onError callback
        if (Object.hasOwnProperty.call(item, 'onError')) {
          callback.onError = {
            params: {
              parentEntry: entry,
              actions: {
                entry: item.onError,
                ...actions
              },
              instance
            },
            method: this._dispatch.bind(this)
          }
        }

        const result = this._action({
          instance,
          entry,
          actions,
          conditions: item.conditions,
          parentEntry,
          name: action.name,
          type: action.type,
          computedParams: action._$computedParams,
          paramType: action.paramType,
          params: action.params,
          callback
        })

        if (result) {
          results[entry] = result
        }
      }

      return results
    },
    _createActions (entry, actions) {
      return { entry, ...actions }
    },
    _action ({
      instance,
      name,
      type,
      computedParams,
      paramType,
      params,
      callback = {},
      entry,
      parentEntry
    }) {
      if (computedParams) {
        params = this.$method('dsParameters/process', {
          instance,
          entry,
          parentEntry,
          paramType,
          params
        })
      }

      return this['_process/' + type]({ name, params, callback })
    },
    /**
     * This callback is used after a rule
     * @callback onEventCallback
     */

    /**
     * Event callback
     * @param {onEventCallback} callback - This callback is expected to be a rule or another function within the workflow scope
     * @param {Object} params - An object that are params for the rules callback
     * @param {*} result - The result from the parent function to pass onto the callback
     */
    _onEvent (callback, params, result) {
      let callbackParams = result

      if (params) {
        callbackParams = { ...params, result }
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

            if (Object.hasOwnProperty.call(item, 'entry')) {
              value = this._action({
                instanceId,
                entry: item.entry,
                parentItemId,
                paramItems: condition.params,
                data,
                lastItem: length === i,
                ...condition.items[item.entry]
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
    '_process/getProcessValue' ({ params, callback }) {
      const onSuccess = callback.onSuccess
      const onError = callback.onError
      const results = params

      if (onSuccess) {
        this._onEvent(onSuccess.method || onSuccess, onSuccess.params, results)
      }

      if (onError) {
        this._onEvent(onError.method || onError, onError.params)
      }

      return results
    },
    '_process/pluginAction' ({ name, params, callback }) {
      this.$action(name, params, callback)
    },
    '_process/pluginMethod' ({ name, params, callback }) {
      const onSuccess = callback.onSuccess
      const results = this.$method(name, params)

      if (onSuccess) {
        this._onEvent(onSuccess.method || onSuccess, onSuccess.params, results)
      }
    }
  }
}

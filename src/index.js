/**
 * @typedef {String} dsActionId - The entry action id
 */

/**
 * @typedef {Object} dsActionItem - Parameters for dsAction
 * @property {boolean} dsActionItem._$computedParams - Declares the params data type is computed
 * @property {string} dsActionItem.type - Parameter process type
 * @property {string} dsActionItem.name - Name of parameter computed process
 * @property {string} dsActionItem.paramType - Data type of parameter that will be computed
 * @property {number} dsActionItem.version - Version of dependent action
 * @property {(dsParameterItem|Array.<string, dsParameterItem>|dsParameterItem[]|string|number)} dsAction.params - dsParameter to pass to current named computed process
 */

/**
 * @typedef {Object} dsActionCondition
 * @property {boolean} dsActionCondition._$computed - Declares the parameter is computed
 * @property {string} dsActionCondition.name - Name of condition operator
 * @property {dsParameterItem[]} dsActionCondition.values - dsParameter to compute values
 */

/**
 * @typedef {Object} dsActionSequence - Action sequence is a linked list to execute actions
 * @property {Array.<string>} dsActionSequence.entry - List of links to action
 */

/**
 * @typedef {Object} dsActionInstance - Scoped data for action
 * @property {Object} dsActionInstance.results - The result value of each action
 * @property {Object} dsActionInstance.iteration
 */

/**
 * @typedef {string} dsActionEntry - The start point of an action
 */

/**
 * @typedef {string} dsActionEntryParent - The previous action set
 */

/**
 * Dooksa action plugin.
 * @namespace dsAction
 */
export default {
  name: 'dsAction',
  version: 1,
  dependencies: [
    {
      name: 'dsParameter',
      version: 1
    }
  ],
  data: {
    actions: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            version: {
              type: 'number'
            }
          }
        }
      }
    },
    conditions: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            version: {
              type: 'number'
            }
          }
        }
      }
    },
    sequenceActions: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          patternProperties: {
            '(^_|[0-9]){3}': {
              type: 'object',
              properties: {
                _$id: {
                  type: 'string',
                  relation: 'dsAction/actions'
                }
              }
            }
          },
          properties: {
            entry: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    sequenceConditions: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          patternProperties: {
            '(^_|[0-9]){3}': {
              type: 'object',
              properties: {
                _$id: {
                  type: 'string',
                  relation: 'dsAction/conditions'
                }
              }
            }
          },
          properties: {
            entry: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  /** @lends DsAction */
  methods: {
    /**
     * Dispatch an action
     * @param {Object} param
     * @param {dsActionId} param.dsActionId - The entry action id
     * @param {Object} param.payload - The data to pass to the action
     */
    dispatch ({ dsActionId, payload }) {
      const sequenceActions = this.$getDataValue({
        name: 'dsAction/sequenceActions',
        id: dsActionId
      })

      if (sequenceActions.isEmpty) return

      const sequenceConditions = this.$getDataValue({
        name: 'dsAction/sequenceConditions',
        id: dsActionId
      })

      this._dispatch({
        sequenceActions: sequenceActions.value,
        sequenceConditions: sequenceConditions.value,
        payload
      })
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
        params = this.$method('dsParameter/process', {
          dsActionInstance: instance,
          dsActionEntry: entry,
          dsActionEntryParent: parentEntry,
          dsParameterType: paramType,
          dsParameterItem: params
        })
      }

      return this['_process/' + type]({ name, params, callback })
    },
    _createActions (entry, actions) {
      return { entry, ...actions }
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
    _dispatch ({
      instance = {
        iteration: {},
        results: {}
      },
      parentEntry,
      sequenceActions = {},
      sequenceConditions = {},
      payload,
      results = {}
    }) {
      let valid = true

      instance.payload = payload

      if (parentEntry) {
        instance.results[parentEntry] = results
      }

      if (sequenceConditions.length) {
        valid = this._compare(sequenceConditions, {
          parentEntry,
          instance
        })
      }

      for (let i = 0; i < sequenceActions.entry.length; i++) {
        const entry = sequenceActions.entry[i]
        const item = sequenceActions[entry]
        let action = item

        if (item._$id) {
          action = this.$getDataValue({
            name: 'dsAction/actions',
            id: item._$id
          }).value
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
              sequenceActions: {
                entry: item.onSuccess,
                ...sequenceActions
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
              sequenceActions: {
                entry: item.onError,
                ...sequenceActions
              },
              instance
            },
            method: this._dispatch.bind(this)
          }
        }

        const result = this._action({
          instance,
          entry,
          sequenceActions,
          sequenceConditions: item.conditions,
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
    /**
     * This callback is used after an action
     * @callback onEventCallback
     */

    /**
     * Event callback
     * @param {onEventCallback} callback - This callback is expected to be a rule or another function within the workflow scope
     * @param {Object} params - An object that are params for the rules callback
     * @param {*} result - The result from the parent function to pass onto the callback
     * @private
     */
    _onEvent (callback, params, result) {
      let callbackParams = result

      if (params) {
        callbackParams = { ...params, result }
      }

      callback(callbackParams)
    },
    '_process/value' ({ params, callback }) {
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
    '_process/action' ({ name, params, callback }) {
      this.$action(name, params, callback)
    },
    '_process/method' ({ name, params, callback }) {
      const onSuccess = callback.onSuccess
      const results = this.$method(name, params)

      if (onSuccess) {
        this._onEvent(onSuccess.method || onSuccess, onSuccess.params, results)
      }
    }
  }
}

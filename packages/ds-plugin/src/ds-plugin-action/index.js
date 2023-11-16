import { definePlugin } from '@dooksa/ds-app'

/**
 * Dooksa action plugin.
 * @namespace dsAction
 */
export default definePlugin({
  name: 'dsAction',
  version: 1,
  data: {
    blocks: {
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    },
    items: {
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsAction/sequences'
          }
        }
      }
    },
    sequences: {
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                relation: 'dsAction/blocks'
              },
              path: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              children: {
                type: 'array',
                items: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  },
  /** @lends dsAction */
  methods: {
    /**
     * Dispatch an action
     * @param {Object} param
     * @param {dsActionId} param.dsActionId - The entry action id
     * @param {Object} param.payload - The data to pass to the action
     */
    dispatch ({ id, payload }) {
      const actions = this.$getDataValue('dsAction/items', { id })

      if (actions.isEmpty) return

      const result = {}

      for (let i = 0; i < actions.item.length; i++) {
        const id = actions.item[i]
        const sequence = this.$getDataValue('dsAction/sequences', { id })

        if (sequence.isEmpty) return

        result[i] = this._processSequence(
          sequence.item,
          payload,
          result
        )
      }
    },
    _processSequence (sequence, payload, results = {}) {
      const sequenceEnd = sequence.length - 1
      const actionData = {}

      for (let i = 0; i < sequenceEnd; i++) {
        const item = sequence[i]
        const action = this._processAction(item, actionData)
        const methodName = '_process/' + action.name

        if (this[methodName]) {
          actionData[i] = {
            item: this[methodName](action.params, payload, actionData, results),
            path: item.path
          }
        } else {
          actionData[i] = {
            item: this.$method(action.name, action.params),
            path: item.path
          }
        }
      }

      // process last action
      const action = this._processAction(sequence[sequenceEnd], actionData)

      if (action.async) {
        this.$action(action.name, action.params, {
          onSuccess: (result) => {
            actionData[sequenceEnd] = result
          },
          onError: (error) => {
            console.error(error)
          }
        })
      } else {
        const methodName = '_process/' + action.name

        if (this[methodName]) {
          return this[methodName](action.params, payload, actionData, results)
        } else {
          return this.$method(action.name, action.params)
        }
      }
    },
    _processAction (item, data) {
      const block = this.$getDataValue('dsAction/blocks', {
        id: item.id
      })

      if (block.isEmpty) {
        throw new Error('No action found: ' + item.id)
      }

      let params = block.item._$arg

      if (item.children) {
        params = structuredClone(block.item._$arg)

        // node to traverse params and update value
        let paramNode = params

        for (let i = 0; i < item.children.length; i++) {
          const child = data[item.children[i]]
          const lastChildIndex = child.path.length - 1

          for (let i = item.path.length + 1; i < lastChildIndex; i++) {
            const path = child.path[i]

            paramNode = paramNode[path]
          }

          paramNode[child.path[lastChildIndex]] = child.item
        }
      }

      return {
        async: block.item.async,
        name: block.item._$a,
        params
      }
    },
    '_process/get/eventValue' (params, payload) {
      return this._getValue(payload, params)
    },
    '_process/get/sequenceValue' (params, payload, actionData, results) {
      return this._getValue(results, params)
    },
    '_process/get/dataValue' (params) {
      const result = this.$getDataValue(params.name, {
        id: params.id,
        prefixId: params.prefixId,
        suffixId: params.suffixId,
        options: params.options
      })

      if (result.isEmpty) {
        return
      }

      return result.item
    },
    '_process/map/actionValue' (params) {
      return this._getValue(params.value, params.map)
    },
    '_process/set/dataValue' (data) {
      return this.$setDataValue(data.name, data.value, data.options)
    },
    _getDataByKey (data, keys) {
      let lastKey

      if (typeof keys === 'string') {
        keys = keys.split('.')
      }

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]

        if (Object.hasOwn(data, key)) {
          data = data[key]
          lastKey = key
        }
      }

      return { result: data, key: lastKey }
    },
    /**
     * Get result value
     * @private
     * @param {*} data
     * @param {Object|string} value
     * @param {string} value.$key - Request to return a specific key/value, dot notations are permitted
     * @param {number} value.$index - Request to return specific indexes from an array
     * @returns {*}
     */
    _getValue (value, query) {
      if (query == null) {
        return value
      }

      if (Object.hasOwn(value, query)) {
        return value[query]
      }

      // get a nested value
      if (Object.hasOwn(query, '$key')) {
        return this._getDataByKey(value, query.$key).result
      }

      // return an object of data
      if (Object.hasOwn(query, '$keys')) {
        const keys = query.$keys
        const result = {}

        for (const key in keys) {
          if (Object.hasOwn(keys, key)) {
            const item = keys[key]
            const dataKey = this._getDataByKey(value, item)

            result[dataKey.key] = dataKey.result
          }
        }

        return result
      }

      if (Object.hasOwn(query, '$index')) {
        const [index, keys] = query.$index
        const valueItem = value[index]

        if (!keys) {
          return valueItem
        }

        const result = {}

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          const dataKey = this._getDataByKey(value, key)

          result[dataKey.key] = dataKey.result
        }

        return result
      }

      if (Object.hasOwn(query, '$indexes')) {
        const result = []

        for (let i = 0; i < query.$indexes.length; i++) {
          const [index, key] = query[i]
          const valueItem = value[index]

          if (key) {
            const dataKey = this._getDataByKey(valueItem, key)

            result.push(dataKey.result)
          } else {
            result.push(valueItem)
          }
        }

        return result
      }

      const result = {}

      for (let i = 0; i < value.length; i++) {
        const key = value[i]
        result[key] = value[key]
      }

      return result
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

            if (Object.hasOwn(item, 'entry')) {
              value = this._action({
                instanceId,
                entry: item.entry,
                parentItemId,
                paramItems: condition.params,
                data,
                lastItem: length === i,
                ...condition.blocks[item.entry]
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
    }
  }
})

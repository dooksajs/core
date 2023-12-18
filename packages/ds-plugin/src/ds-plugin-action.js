import { deepClone } from '@dooksa/utils'
import { definePlugin } from '@dooksa/ds-scripts'

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
            type: 'object',
            properties: {
              id: {
                type: 'string',
                relation: 'dsAction/sequences'
              },
              blocks: {
                type: 'object',
                patternProperties: {
                  '^[0-9]+$': {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        relation: 'dsAction/blocks'
                      },
                      values: {
                        type: 'array'
                      }
                    }
                  }
                }
              }
            }
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
    },
    process: {
      private: true,
      schema: {
        type: 'object'
      }
    }
  },
  /** @lends dsAction */
  methods: {
    /**
     * Dispatch an action
     * @param {Object} param
     * @param {string} param.id - The Id of action
     * @param {Object} param.payload - The data to pass to the action
     */
    dispatch ({ id, payload }) {
      const actions = this.$getDataValue('dsAction/items', { id, options: { expand: true } })

      if (actions.isEmpty) {
        this.$log('error', { message: 'Expected action item is missing: ' + id })
        return
      }

      const sequenceProcess = {
        position: 0,
        items: [],
        results: {}
      }
      sequenceProcess.next = () => {
        this._nextProcess(sequenceProcess)
      }

      for (let i = 0; i < actions.item.length; i++) {
        const item = actions.item[i]
        let sequence
        let expand = []
        let expandIndexes = {}

        if (!actions.isExpandEmpty) {
          const key = actions.expandIncluded['dsAction/sequences/' + item.id]

          sequence = actions.expand[key]

          if (!sequence) {
            this.$log('error', { message: 'Broken action sequence', code: '50' })

            return
          }

          sequence = sequence.item
          expand = actions.expand
          expandIndexes = actions.expandIncluded
        } else {
          sequence = this.$getDataValue('dsAction/sequences', { id: item.id })

          if (sequence.isEmpty) {
            this.$log('error', { message: 'Broken action sequence', code: '50' })

            return
          }

          sequence = sequence.item
        }

        sequenceProcess.items.push(() => {
          this._processSequence(
            sequence,
            payload,
            item.blocks,
            expand,
            expandIndexes,
            i,
            sequenceProcess
          )
        })
      }

      sequenceProcess.next()
    },
    _nextProcess (process) {
      const item = process.items[process.position++]

      // go next
      if (typeof item === 'function') {
        item()

        return true
      }

      return false
    },
    _nextBranchProcess (process) {
      process.position = process.goto[process.gotoIndex++]

      const item = process.items[process.position]

      // go next
      if (typeof item === 'function') {
        item()

        return true
      }

      return false
    },
    _processSequence (sequence, payload, blocks = {}, expand, expandIndexes, position, currentProcess) {
      const sequenceEnd = sequence.length - 1
      const blockProcess = {
        position: 0,
        items: [],
        results: {}
      }

      // Add next block process
      blockProcess.next = () => {
        const isNext = this._nextProcess(blockProcess)

        if (!isNext) {
          // append final result to sequence process
          currentProcess.results[position] = blockProcess.results[blockProcess.results.length - 1]
          currentProcess.next()
        }
      }

      for (let i = 0; i < sequence.length; i++) {
        const item = sequence[i]
        const block = { id: item.id }
        const blockOverwrites = blocks[i]

        if (blockOverwrites) {
          block.id = blockOverwrites.id
          block.values = blockOverwrites.values
        }

        if (expand) {
          const key = expandIndexes['dsAction/blocks/' + block.id]
          const blockData = expand[key]

          if (blockData) {
            block.item = blockData.item
          }
        }

        const blockItem = () => {
          const action = this._createAction(item, block, blockProcess.results)
          const methodName = '_process/' + action.name

          if (this[methodName]) {
            const lastBlock = sequenceEnd === i

            blockProcess.results[i] = {
              item: this[methodName](action.params, payload, lastBlock, blockProcess, currentProcess),
              path: item.path
            }
            blockProcess.next()
          } else if (action.async) {
            this.$action(action.name, action.params, {
              onSuccess: (result) => {
                blockProcess.results[i] = {
                  item: result,
                  path: item.path
                }
                blockProcess.next()
              },
              onError: (error) => {
                this.$log('error', { message: 'Action block', cause: error })
              }
            })
          } else {
            blockProcess.results[i] = {
              item: this.$method(action.name, action.params),
              path: item.path
            }
            blockProcess.next()
          }
        }

        blockProcess.items.push(blockItem)
      }

      // run block process
      blockProcess.next()
    },
    _createAction (item, block, data) {
      if (!block.item) {
        const blockData = this.$getDataValue('dsAction/blocks', { id: item.id })

        if (block.isEmpty) {
          throw new Error('No action found: ' + item.id)
        }

        block.item = blockData.item
      }

      let deepCloned = false

      if (block.values) {
        block.item = deepClone({}, block.item)
        deepCloned = true

        for (let i = 0; i < block.values.length; i++) {
          const keys = block.values[i].keys
          const lastKey = keys.length - 1
          let blockValue = block.item

          for (let j = 0; j < lastKey; j++) {
            const key = keys[j]

            blockValue = blockValue[key]
          }

          blockValue[keys[lastKey]] = block.values[i].value
        }
      }

      let params = block.item._$arg

      if (item.children) {
        if (!deepCloned) {
          params = deepClone({}, block.item._$arg)
        }

        for (let i = 0; i < item.children.length; i++) {
          const child = data[item.children[i]]
          const lastChildIndex = child.path.length - 1

          // node to traverse params and update value
          let paramNode = params

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
    '_process/delete/dataValue' (params) {
      return this.$deleteDataValue(params.name, params.id, {
        cascade: params.cascade,
        listeners: params.listeners
      })
    },
    '_process/condition' (params, payload, lastBlock, blockProcess, currentProcess) {
      let isValid

      if (params.if.length > 1) {
        const compareValues = []

        for (let i = 0; i < params.if.length; i++) {
          const item = params.if[i]

          // compare one or more results
          let compareItem = item

          if (item !== '&&' || item !== '||') {
            compareItem = this.$method('dsOperator/eval', {
              name: item.op,
              values: [item.from, item.to]
            })
          }

          compareValues.push(compareItem)
        }

        isValid = this.$method('dsOperator/compare', compareValues)
      } else {
        const item = params.if[0]
        isValid = this.$method('dsOperator/eval', {
          name: item.op,
          values: [item.from, item.to]
        })
      }

      // sequence conditional
      let process = currentProcess

      // action block conditional
      if (!lastBlock) {
        process = blockProcess
      }

      if (isValid) {
        process.goto = params.then
      } else {
        process.goto = params.else
      }

      process.gotoIndex = 0
      process.next = () => {
        this._nextBranchProcess(currentProcess)
      }
    },
    '_process/get/eventValue' (params, payload) {
      return this._getValue(payload, params)
    },
    '_process/get/sequenceValue' (params, payload, lastBlock, blockProcess, currentProcess) {
      return this._getValue(currentProcess.results, params)
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
    '_process/get/actionValue' (params) {
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

        if (Object.hasOwnProperty.call(data, key)) {
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

      if (Object.hasOwnProperty.call(value, query)) {
        return value[query]
      }

      // get a nested value
      if (Object.hasOwnProperty.call(query, '$key')) {
        return this._getDataByKey(value, query.$key).result
      }

      // return an object of data
      if (Object.hasOwnProperty.call(query, '$keys')) {
        const keys = query.$keys
        const result = {}

        for (const key in keys) {
          if (Object.hasOwnProperty.call(keys, key)) {
            const item = keys[key]
            const dataKey = this._getDataByKey(value, item)

            result[dataKey.key] = dataKey.result
          }
        }

        return result
      }

      if (Object.hasOwnProperty.call(query, '$index')) {
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

      if (Object.hasOwnProperty.call(query, '$indexes')) {
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
    }
  }
})

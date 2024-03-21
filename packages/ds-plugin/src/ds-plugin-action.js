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
    },
    process: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    values: {
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              relation: 'dsAction/items'
            }
          }
        }
      }
    }
  },
  methods: {
    /**
     * Dispatch an action
     * @param {Object} param
     * @param {string} param.id - The Id of action
     * @param {Object} param.context - The context of where the actions was emitted
     * @param {Object} param.payload - The data to pass to the action
     */
    dispatch ({ id, context, payload }) {
      const actions = this.$getDataValue('dsAction/items', { id, options: { expand: true } })

      if (actions.isEmpty) {
        return this.$action('dsDatabase/getById', {
          collection: 'action',
          id,
          expand: true
        }, {
          onSuccess: (data) => {
            if (!data.isEmpty) {
              this.dispatch({ id, context, payload })
            } else {
              this.$log('warn', {
                message: 'No action found: ' + id
              })
            }
          },
          onError: (error) => {
            this.$log('error', {
              message: 'No action found: ' + id,
              error
            })
          }
        })
      }

      let blocks = {}

      // fetch block modifiers
      if (context.dsWidgetId) {
        blocks = this.$getDataValue('dsWidget/actions', {
          id: context.dsWidgetId,
          suffixId: context.dsWidgetMode
        })

        if (!blocks.isEmpty && blocks.item[id]) {
          blocks = blocks.item[id]
        }

        // set action item id to payload for grouping
        context.id = context.dsWidgetId
      } else {
        context.id = context.dsSectionId || context.dsViewId || context.dsContentId
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
        const sequenceId = actions.item[i]
        let sequence
        let expand = []
        let expandIndexes = {}

        if (!actions.isExpandEmpty) {
          const key = actions.expandIncluded['dsAction/sequences/' + sequenceId]

          sequence = actions.expand[key]

          if (!sequence) {
            this.$log('error', { message: 'Broken action sequence', code: '50' })

            return
          }

          sequence = sequence.item
          expand = actions.expand
          expandIndexes = actions.expandIncluded
        } else {
          sequence = this.$getDataValue('dsAction/sequences', { id: sequenceId })

          if (sequence.isEmpty) {
            this.$log('error', { message: 'Broken action sequence', code: '50' })

            return
          }

          sequence = sequence.item
        }

        sequenceProcess.items.push(() => {
          this._processSequence(
            sequence,
            context,
            payload,
            blocks[sequenceId] || {},
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
    _processSequence (sequence, context, payload, blocks, expand, expandIndexes, position, sequenceProcess) {
      const sequenceEnd = sequence.length - 1
      const blockProcess = {
        position: 0,
        items: [],
        results: []
      }

      // Add next block process
      blockProcess.next = () => {
        const isNext = this._nextProcess(blockProcess)

        if (!isNext) {
          // append final result to sequence process
          sequenceProcess.results[position] = blockProcess.results[blockProcess.results.length - 1].item
          sequenceProcess.next()
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

            blockProcess.results.push({
              item: this[methodName](action.params, context, payload, lastBlock, blockProcess, sequenceProcess),
              path: item.path
            })
            blockProcess.next()
          } else if (action.async) {
            this.$action(action.name, action.params, {
              onSuccess: (result) => {
                blockProcess.results.push({
                  item: result,
                  path: item.path
                })
                blockProcess.next()
              },
              onError: (error) => {
                console.error(error)
                this.$log('error', { message: 'Action block', cause: error })
              }
            })
          } else {
            blockProcess.results.push({
              item: this.$method(action.name, action.params),
              path: item.path
            })
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
    '_process/delete/dataValue' (props) {
      return this.$deleteDataValue(props.name, props.id, {
        cascade: props.cascade,
        listeners: props.listeners
      })
    },
    '_process/condition' (props, context, payload, lastBlock, blockProcess, sequenceProcess) {
      let isValid

      if (props.if.length > 1) {
        const compareValues = []

        for (let i = 0; i < props.if.length; i++) {
          const item = props.if[i]

          // compare one or more results
          let compareItem = item

          if (item.andOr !== '&&' && item.andOr !== '||') {
            compareItem = this.$method('dsOperator/eval', {
              name: item.op,
              values: [item.from, item.to]
            })
          } else {
            compareItem = item.andOr
          }

          compareValues.push(compareItem)
        }

        isValid = this.$method('dsOperator/compare', compareValues)
      } else {
        const item = props.if[0]
        isValid = this.$method('dsOperator/eval', {
          name: item.op,
          values: [item.from, item.to]
        })
      }

      // sequence conditional
      let process = sequenceProcess

      // action block conditional
      if (!lastBlock) {
        process = blockProcess
      }

      if (isValid) {
        process.goto = props.then
      } else {
        process.goto = props.else
      }

      process.gotoIndex = 0
      process.next = () => {
        this._nextBranchProcess(sequenceProcess)
      }
    },
    '_process/get/actionValue' (props, context) {
      let id = this.$getDataValue('dsWidget/actionGroups', { id: context.dsWidgetId }).item

      if (!id) {
        id = context.id
      }

      const value = this.$getDataValue('dsAction/values', { id })

      if (!value.isEmpty) {
        return this._getValue(value.item, props)
      }

      this.$log('error', { message: 'Action variables not found', code: '44' })
    },
    '_process/get/blockValue' (props) {
      if (props.value) {
        return this._getValue(props.value, props.map)
      }
    },
    '_process/get/dataValue' (props) {
      const options = {
        prefixId: props.prefixId,
        suffixId: props.suffixId,
        options: props.options
      }

      if (Object.hasOwnProperty.call(props, 'id')) {
        if (props.id) {
          options.id = props.id
        } else {
          return
        }
      }

      const result = this.$getDataValue(props.name, options)

      if (!result.isEmpty) {
        return result.item
      }
    },
    '_process/get/contextValue' (props, context) {
      return this._getValue(context, props)
    },
    '_process/get/payloadValue' (props, context, payload) {
      return this._getValue(payload, props)
    },
    '_process/get/sequenceValue' (props, context, payload, lastBlock, blockProcess, sequenceProcess) {
      return this._getValue(sequenceProcess.results, props)
    },
    '_process/set/actionValue' (props, context) {
      const values = {}
      let id = this.$getDataValue('dsWidget/actionGroups', { id: context.dsWidgetId }).item

      if (!id) {
        id = context.id
      }

      for (let i = 0; i < props.values.length; i++) {
        const item = props.values[i]
        let id = item.id

        if (item.prefixId) {
          id = item.prefixId + id
        }

        if (item.suffixId) {
          id = id + item.suffixId
        }

        values[id] = item.value
      }

      this.$setDataValue('dsAction/values', values, {
        id,
        merge: true
      })
    },
    '_process/set/dataValue' (props) {
      return this.$setDataValue(props.name, props.value, props.options)
    },
    _getDataByKey (data, keys) {
      let lastKey
      let result

      if (typeof keys === 'string') {
        keys = keys.split('.')
      }

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]

        if (Object.hasOwnProperty.call(data, key)) {
          data = data[key]
          lastKey = key
          result = data
        }
      }

      return { result, key: lastKey }
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

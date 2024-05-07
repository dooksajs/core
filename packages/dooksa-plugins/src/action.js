import { createPlugin } from '@dooksa/create'
import { deepClone } from '@dooksa/utils'
import operator from './operator.js'
import data from './data.js'

const action = createPlugin('action', ({ defineData, defineActions }, { $getDataValue, $setDataValue, $deleteDataValue, $action }) => {
  const operatorEval = operator.eval
  const operatorCompare = operator.compare
  const generateId = data.generateId

  const processAction = {
    'delete/dataValue' (props) {
      return $deleteDataValue(props.name, props.id, {
        cascade: props.cascade,
        listeners: props.listeners
      })
    },
    'eval/condition' (props, context, payload, lastBlock, blockProcess, sequenceProcess) {
      let isValid

      if (props.if.length > 1) {
        const compareValues = []

        for (let i = 0; i < props.if.length; i++) {
          const item = props.if[i]

          // compare one or more results
          let compareItem = item

          if (item.andOr !== '&&' && item.andOr !== '||') {
            compareItem = operatorEval({
              name: item.op,
              values: [item.from, item.to]
            })
          } else {
            compareItem = item.andOr
          }

          compareValues.push(compareItem)
        }

        isValid = operatorCompare(compareValues)
      } else {
        const item = props.if[0]
        isValid = operatorEval({
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
        nextBranchProcess(sequenceProcess)
      }

      return isValid
    },
    'get/actionValue' (props) {
      const value = $getDataValue('action/values', { id: props.id })

      if (!value.isEmpty) {
        return getValue(value.item, props)
      }

      throw new Error('Action variables not found')
    },
    'get/blockValue' (props) {
      if (props.value) {
        return getValue(props.value, props.map)
      }
    },
    'get/dataValue' (props) {
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

      const result = $getDataValue(props.name, options)

      if (!result.isEmpty) {
        return result.item
      }
    },
    'get/contextValue' (props, context) {
      return getValue(context, props)
    },
    'get/payloadValue' (props, context, payload) {
      return getValue(payload, props)
    },
    'get/sequenceValue' (props, context, payload, lastBlock, blockProcess, sequenceProcess) {
      return getValue(sequenceProcess.results, props)
    },
    'set/actionValue' (props) {
      const values = {}
      const id = props.id

      for (let i = 0; i < props.values.length; i++) {
        const item = props.values[i]
        let valueId = item.id || generateId()

        if (item.prefixId) {
          valueId = item.prefixId + valueId
        }

        if (item.suffixId) {
          valueId = valueId + item.suffixId
        }

        values[valueId] = item.value
      }

      return $setDataValue('action/values', values, {
        id,
        merge: true
      })
    },
    'set/dataValue' (props) {
      return $setDataValue(props.name, props.value, props.options)
    }
  }

  defineData({
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
            relation: 'action/sequences'
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
                relation: 'action/blocks'
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
    values: {
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              relation: 'action/items'
            }
          }
        }
      }
    }
  })

  defineActions({
    /**
     * Dispatch an action
     * @param {Object} param
     * @param {string} param.id - The Id of action
     * @param {Object} param.context - The context of where the actions was emitted
     * @param {Object} param.payload - The data to pass to the action
     */
    dispatch ({ id, context, payload }) {
      return new Promise((resolve, reject) => {
        const actions = $getDataValue('action/items', { id, options: { expand: true } })

        if (actions.isEmpty) {
          return $action('dsDatabase/getById', {
            collection: 'action',
            id,
            expand: true
          }, {
            onSuccess: (data) => {
              if (!data.isEmpty) {
                this.dispatch({ id, context, payload })
              } else {
                throw new Error('No action found: ' + id)
              }
            },
            onError: (error) => {
              reject(error)
            }
          })
        }

        let blocks = {}

        // fetch block modifiers
        if (context.dsWidgetId) {
          blocks = $getDataValue('widget/actions', {
            id: context.dsWidgetId,
            suffixId: context.dsWidgetMode
          })

          if (!blocks.isEmpty && blocks.item[id]) {
            blocks = blocks.item[id]
          }
        }

        const sequenceProcess = {
          position: 0,
          items: [],
          results: {},
          resolve: resolve
        }
        sequenceProcess.next = () => {
          nextProcess(sequenceProcess)
        }

        for (let i = 0; i < actions.item.length; i++) {
          const sequenceId = actions.item[i]
          let sequence
          let expand = []
          let expandIndexes = {}

          if (!actions.isExpandEmpty) {
            const key = actions.expandIncluded['action/sequences/' + sequenceId]

            sequence = actions.expand[key]

            if (!sequence) {
              throw new Error('Broken action sequence')
            }

            sequence = sequence.item
            expand = actions.expand
            expandIndexes = actions.expandIncluded
          } else {
            sequence = $getDataValue('action/sequences', { id: sequenceId })

            if (sequence.isEmpty) {
              throw new Error('Broken action sequence')
            }

            sequence = sequence.item
          }

          sequenceProcess.items.push(() => {
            processSequence(
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
      })
    }
  })

  function nextProcess (process) {
    const item = process.items[process.position++]

    // go next
    if (typeof item === 'function') {
      item()

      return true
    }

    if (process.resolve) {
      process.resolve()
    }

    return false
  }

  function nextBranchProcess (process) {
    process.position = process.goto[process.gotoIndex++]

    const item = process.items[process.position]

    // go next
    if (typeof item === 'function') {
      item()

      return true
    }

    if (process.resolve) {
      process.resolve()
    }

    return false
  }

  function processSequence (sequence, context, payload, blocks, expand, expandIndexes, position, sequenceProcess) {
    const sequenceEnd = sequence.length - 1
    const blockProcess = {
      position: 0,
      items: [],
      results: []
    }

    // Add next block process
    blockProcess.next = () => {
      const isNext = nextProcess(blockProcess)

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
        const key = expandIndexes['action/blocks/' + block.id]
        const blockData = expand[key]

        if (blockData) {
          block.item = blockData.item
        }
      }

      const blockItem = () => {
        const action = createAction(item, block, blockProcess.results)

        // process local action
        if (processAction[action.name]) {
          const lastBlock = sequenceEnd === i

          blockProcess.results.push({
            item: processAction[action.name](action.params, context, payload, lastBlock, blockProcess, sequenceProcess),
            path: item.path
          })
          blockProcess.next()
        } else {
          $action(action.name, action.params, {
            onSuccess: (result) => {
              blockProcess.results.push({
                item: result,
                path: item.path
              })
              blockProcess.next()
            },
            onError: (error) => {
              throw new Error('Broken action block', { cause: error })
            }
          })
        }
      }

      blockProcess.items.push(blockItem)
    }

    // run block process
    blockProcess.next()
  }

  function createAction (item, block, data) {
    if (!block.item) {
      const blockData = $getDataValue('action/blocks', { id: item.id })

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
  }


  function getDataByKey (data, keys) {
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
  }

  /**
   * Get result value
   * @private
   * @param {*} data
   * @param {Object|string} value
   * @param {string} value.$key - Request to return a specific key/value, dot notations are permitted
   * @param {number} value.$index - Request to return specific indexes from an array
   * @returns {*}
   */
  function getValue (value, query) {
    if (query == null) {
      return value
    }

    if (Object.hasOwnProperty.call(value, query)) {
      return value[query]
    }

    // get a nested value
    if (Object.hasOwnProperty.call(query, '$key')) {
      return getDataByKey(value, query.$key).result
    }

    // return an object of data
    if (Object.hasOwnProperty.call(query, '$keys')) {
      const keys = query.$keys
      const result = {}

      for (const key in keys) {
        if (Object.hasOwnProperty.call(keys, key)) {
          const item = keys[key]
          const dataKey = getDataByKey(value, item)

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
        const dataKey = getDataByKey(value, key)

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
          const dataKey = getDataByKey(valueItem, key)

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
})

const actionDispatch = action.actions.dispatch

export {
  actionDispatch
}

export default action

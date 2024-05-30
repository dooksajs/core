import createPlugin from '@dooksa/create-plugin'
import { deepClone } from '@dooksa/utils'
import { operatorCompare, operatorEval } from './operator.js'
import { dataGenerateId, $getDataValue, $setDataValue, $deleteDataValue } from './data.js'
import { $fetchById } from './fetch.js'

/**
 * @typedef {import('../../types.js').SetDataOptions} SetDataOptions
 * @typedef {import('../../types.js').GetDataQuery} GetDataQuery
 * @typedef {import('../../types.js').DataSchema} DataSchema
 * @typedef {import('../../types.js').DataWhere} DataWhere
 */


let $action

const processAction = {
  /**
   * Delete data value
   * @param {Object} props
   * @param {string} props.name - Collection name
   * @param {string} props.id - document name
   * @param {boolean} props.cascade - Delete related documents
   * @param {boolean} props.listeners - Delete data listeners
   * @returns
   */
  delete_dataValue (props) {
    return $deleteDataValue(props.name, props.id, {
      cascade: props.cascade,
      listeners: props.listeners
    })
  },
  /**
   * Compare two or more values
   * @param {Object} props
   * @param {Object[]} props.if
   * @param {'=='|'!='|'>'|'>='|'<'|'<='|'!'|'%'|'++'|'--'|'-'|'+'|'*'|'**'|'!!'|'~'} props.if[].op
   * @param {string|number} props.if[].from
   * @param {string|number} props.if[].to
   * @param {'&&'|'||'} props.if[].andOr
   * @param {number[]} props.then
   * @param {number[]} props.else
   * @param {*} context
   * @param {*} payload
   * @param {*} lastBlock
   * @param {*} blockProcess
   * @param {*} sequenceProcess
   * @returns {boolean}
   */
  eval_condition (props, context, payload, lastBlock, blockProcess, sequenceProcess) {
    let isValid

    if (props.if.length > 1) {
      const compareValues = []
      /**
       * @type {Object}
       * @property {*} value_1
       * @property {*} value_2
       * @property {'&&'|'||'} op
       */
      let compareItem = {}

      for (let i = 0; i < props.if.length; i++) {
        const item = props.if[i]
        const value = operatorEval({
          name: item.op,
          values: [item.from, item.to]
        })

        if (!compareItem.value_1) {
          compareItem.value_1 = value
        }

        if (!compareItem.op) {
          compareItem.op = item.andOr
        }

        if (!compareItem.value_2) {
          if (!compareItem.op) {
            throw new Error('Condition expects an operator')
          }

          compareItem.value_2 = value
          compareValues.push(compareItem)
          compareItem = {}
        }
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
  /**
   * Get action variable value
   * @param {Object} props
   * @param {string} props.id
   * @param {GetValueQuery} props.query
   */
  get_actionValue (props) {
    const value = $getDataValue('action/values', { id: props.id })

    if (!value.isEmpty) {
      return getValue(value.item, props.query)
    }

    throw new Error('Action variables not found')
  },
  /**
   * Get block value
   * @param {Object} props
   * @param {*} props.value
   * @param {GetValueQuery} props.query
   */
  get_blockValue (props) {
    if (props.value) {
      return getValue(props.value, props.query)
    }
  },
  /**
   * Get data value
   * @param {Object} props
   * @param {string} props.name
   * @param {GetDataQuery} [props.query]
   */
  get_dataValue (props) {
    const result = $getDataValue(props.name, props.query)

    if (!result.isEmpty) {
      return result.item
    }
  },
  /**
   * Get context value
   * @param {GetValueQuery} props
   * @param {Object} context
   */
  get_contextValue (props, context) {
    return getValue(context, props)
  },
  /**
   * Get payload value
   * @param {GetValueQuery} props
   * @param {Object} context
   * @param {*} payload
   */
  get_payloadValue (props, context, payload) {
    return getValue(payload, props)
  },
  /**
   * Get sequence result value
   * @param {GetValueQuery} props
   * @param {Object} sequenceProcess
   * @param {Array} sequenceProcess.results
   */
  get_sequenceValue (props, context, payload, lastBlock, blockProcess, sequenceProcess) {
    return getValue(sequenceProcess.results, props)
  },
  /**
   * Set action variable value
   * @param {Object} props
   * @param {string} props.id
   * @param {Object[]} props.values
   * @param {string} [props.values[].id]
   * @param {string} [props.values[].prefixId]
   * @param {string} [props.values[].suffixId]
   * @param {*} props.values[].value
   */
  set_actionValue (props) {
    const values = {}
    const id = props.id

    for (let i = 0; i < props.values.length; i++) {
      const item = props.values[i]
      let valueId = item.id || dataGenerateId()

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
  /**
   * Set data value
   * @param {Object} props
   * @param {string} props.name
   * @param {*} props.value
   * @param {SetDataOptions} props.options
   */
  set_dataValue (props) {
    return $setDataValue(props.name, props.value, props.options)
  }
}

function nextProcess (process) {
  const item = process.items[process.position++]

  // go next
  if (typeof item === 'function') {
    item()

    return true
  }

  if (process.resolve) {
    process.resolve(process.results)
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
    process.resolve(process.results)
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
            /**
             * @TODO Console error
             * Until browser support cause @link https://caniuse.com/mdn-javascript_builtins_error_cause_displayed_in_console
             */
            if (navigator.userAgent.indexOf('Firefox') === -1) {
              console.error(error)
            }

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
    name: block.item._$a,
    params
  }
}

/**
 * @typedef {string[]|string} GetValueQuery
 */

/**
 * Get result value
 * @private
 * @param {*} value
 * @param {GetValueQuery} [query] - Request to return a specific key value, dot notations are permitted
 * @returns {*[]|*}
 */
function getValue (value, query) {
  if (query == null) {
    return value
  }

  // get single value
  if (typeof query === 'string') {
    const keys = query.split('.')

    if (keys.length === 1) {
      return value[keys[0]]
    }

    let result = value

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (result[key] != null) {
        result = result[key]
      } else {
        /** @TODO Create custom ReferenceError */
        throw new Error('Action get value was not defined: ' + key)
      }
    }

    return result
  }

  const results = []

  // get multiple values
  for (let i = 0; i < query.length; i++) {
    const keys = query[i].split('.')

    if (query.length === 1 && keys.length === 1) {
      return value[keys[0]]
    }

    let result = value

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (Object.hasOwnProperty.call(result, key)) {
        result[key]
      } else {
        /** @TODO Create custom ReferenceError */
        throw new Error('Action get value was not defined: ' + key)
      }
    }

    results.push(result)
  }

  return results
}

const action = createPlugin({
  name: 'action',
  models: {
    blocks: {
      type: 'collection',
      items: {
        type: 'object'
      }
    },
    items: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'action/sequences'
        }
      }
    },
    sequences: {
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
    },
    values: {
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
  },
  actions: {
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
          return $fetchById({
            collection: 'action',
            id: [id],
            expand: true
          })
            .then(data => {
              if (data.isEmpty) {
                throw new Error('No action found: ' + id)
              }
              this.dispatch({ id, context, payload })
                .then(result => resolve(result))
                .then(error => reject(error))
            })
            .catch(error => reject(error))
        }

        let blocks = {}

        // fetch block modifiers
        if (context.widgetId) {
          blocks = $getDataValue('widget/actions', {
            id: context.widgetId,
            suffixId: context.widgetMode
          })

          if (!blocks.isEmpty && blocks.item[id]) {
            blocks = blocks.item[id]
          }
        }

        const sequenceProcess = {
          position: 0,
          items: [],
          results: {},
          resolve: resolve,
          reject: reject
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
  },
  setup ({ action }) {
    $action = action
  }
})

const actionDispatch = action.actions.dispatch

export {
  actionDispatch
}

export default action

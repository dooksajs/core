import createPlugin from '@dooksa/create-plugin'
import { fetchById } from './fetch.js'
import { dataGetValue } from './data.js'
import { operatorCompare, operatorEval } from './operator.js'

/**
 * @typedef {import('../../types.js').SetDataOptions} SetDataOptions
 * @typedef {import('../../types.js').GetDataQuery} GetDataQuery
 * @typedef {import('../../types.js').DataSchema} DataSchema
 * @typedef {import('../../types.js').DataWhere} DataWhere
 */

const dataTypes = {
  object: () => ({}),
  array: () => ([])
}
let $action = (name, param, context, callback) => {}

function getValue (block, context, payload, blockValues) {
  if (block.hasOwnProperty('blockValues')) {
    return getBlockValues(block, context, payload, blockValues)
  }

  const result = {
    key: block.key,
    value: block.value
  }

  if (block.hasOwnProperty('blockValue')) {
    result.value = blockValues[block.blockValue]
  }

  return result
}

function getBlockValues (block, context, payload, blockValues) {
  const value = dataTypes[block.dataType]()
  const blocks = block.blockValues

  for (let i = 0; i < blocks.length; i++) {
    const id = blocks[i]
    const block = dataGetValue({ name: 'action/blocks', id })

    if (block.isEmpty) {
      throw new Error('Action: block could not be found: ' + id)
    }

    const result = getValue(block.item, context, payload, blockValues)

    value[result.key] = result.value
    blockValues[id] = value
  }

  return {
    key: block.key,
    value
  }
}

function processSequence (sequence, context, payload, blockValues = {}) {
  const blockProcess = []
  let blockProcessIndex = 0

  for (let i = 0; i < sequence.length; i++) {
    const blockSequence = dataGetValue({ name: 'action/blockSequences', id: sequence[i] }).item

    for (let j = 0; j < blockSequence[i].length; j++) {
      const id = blockSequence[i][j]
      const block = dataGetValue({ name: 'action/blocks', id })

      if (block.isEmpty) {
        throw new Error('Action: block could not be found: ' + id )
      }

      if (block.item.method) {
        blockProcess.push(() => {
          const blockResult = getValue(block, context, payload, blockValues)

          blockProcessIndex++

          $action(block.item.method, blockResult.value, { context, payload, blockValues }, {
            onSuccess: (result => {
              blockValues[id] = result

              if (blockProcess[blockProcessIndex]) {
                blockProcess[blockProcessIndex]()
              }
            }),
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
        })
      }
    }

    const nextProcess = blockProcess[blockProcessIndex]

    if (typeof nextProcess === 'function') {
      nextProcess()
    }
  }
}

const action = createPlugin('action', {
  models: {
    blocks: {
      type: 'collection',
      items: {
        type: 'object',
        properties: {
          method: {
            type: 'string'
          },
          dataType: {
            type: 'string'
          },
          blockValue: {
            type: 'string',
            relation: 'action/blocks'
          },
          blockValues: {
            type: 'array',
            items: {
              type: 'string',
              relation: 'action/blocks'
            }
          },
          key: {
            type: 'string'
          }
        }
      }
    },
    blockSequences: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'action/blocks'
        }
      }
    },
    dependencies: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'action/items'
        },
        uniqueItems: true
      }
    },
    sequences: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'action/blockSequences'
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
            relation: 'action/blocks'
          }
        }
      }
    },
    templates: {
      type: 'collection',
      items: {
        type: 'object',
        properties: {
          blocks: {
            type: 'object',
            properties: {
              method: {
                type: 'string'
              },
              dataType: {
                type: 'string'
              },
              blockValue: {
                type: 'string',
                relation: 'action/blocks'
              },
              blockValues: {
                type: 'array',
                items: {
                  type: 'string',
                  relation: 'action/blocks'
                }
              },
              key: {
                type: 'string'
              }
            }
          },
          blockSequences: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          sequences: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  metadata: {
    plugin: {
      title: 'Action',
      description: 'Dooksa runtime interpreter',
      icon: 'mdi:code-braces-box'
    },
    actions: {
      dispatch: {
        title: 'Dispatch',
        description: 'Execute an action',
        icon: 'mdi:play-box-multiple'
      },
      getActionValue: {
        title: 'Get variable',
        description: 'Retrieve variable value',
        icon: 'mdi:application-variable'
      },
      getBlockValue: {
        title: 'Get action block value',
        description: 'Get value from returned action block value',
        icon: 'mdi:variable-box'
      },
      getContextValue: {
        title: 'Get context value',
        description: 'Get value from current context values',
        icon: 'mdi:variable'
      },
      getPayloadValue: {
        title: 'Get payload value',
        description: 'Get data from current event payload',
        icon: 'mdi:input'
      },
      getSequenceValue: {
        title: 'Get sequence value',
        description: 'Get value from current sequence action',
        icon: 'mdi:format-list-numbered'
      },
      ifElse: {
        title: 'Condition',
        description: 'The if...else statement executes a action',
        icon: 'mdi:source-branch'
      },
      setActionValue: {
        title: 'Set variable',
        description: 'Store local variable',
        icon: 'mdi:content-save-plus'
      }
    }
  },
  actions: {
    dispatch ({ id }, { context, payload, blockValues }) {
      return new Promise((resolve, reject) => {
        const sequence = dataGetValue({
          name: 'action/sequences',
          id,
          options: {
            expand: true
          }
        })

        // attempt to fetch action from backend
        if (sequence.isEmpty) {
          return fetchById({
            collection: 'action/sequences',
            id: [id],
            expand: true
          })
            .then(data => {
              if (data.isEmpty) {
                reject(new Error('No action found: ' + id))
              }

              this.dispatch({
                id
              }, { context, payload, blockValues })
                .then(result => resolve(result))
                .then(error => reject(error))
            })
            .catch(error => reject(error))
        }

        try {
          processSequence(sequence.item, context, payload, blockValues)
        } catch (error) {
          reject(error)
        }
      })
    },
    /**
     * Get action variable value
     * @param {Object} props
     * @param {string} props.id
     * @param {GetDataQuery} props.query
     */
    getActionValue (props) {
      const value = dataGetValue({ name: 'action/values', id: props.id })

      if (!value.isEmpty) {
        return getValue(value.item, props.query)
      }
    },
    /**
     * Get block value
     * @param {Object} props
     * @param {*} props.value
     * @param {GetDataQuery} props.query
     */
    getBlockValue (props) {
      if (props.value) {
        return getValue(props.value, props.query)
      }
    },
    /**
     * Get context value
     * @param {GetDataQuery} props
     * @param {Object} ctx
     */
    getContextValue (props, ctx) {
      return getValue(ctx.context, props)
    },
    /**
     * Get payload value
     * @param {GetDataQuery} props
     */
    getPayloadValue (props, { payload }) {
      return getValue(payload, props)
    },
    /**
     * Conditional statement
     * @param {Object} props
     * @param {Object} props.branch
     * @param {Object[]} props.branch.if
     * @param {'=='|'!='|'>'|'>='|'<'|'<='|'!'|'%'|'++'|'--'|'-'|'+'|'*'|'**'|'!!'|'~'} props.branch.if[].op
     * @param {string|number} props.branch.if[].from
     * @param {string|number} props.branch.if[].to
     * @param {'&&'|'||'} props.branch.if[].andOr
     * @param {number[]} props.branch.then
     * @param {number[]} props.branch.else
     * @param {*} props.context
     * @param {*} props.payload
     * @param {*} props.blockValues
     */
    ifElse ({ branch }, { context, payload, blockValues }) {
      let isTruthy = false

      if (branch.if.length > 1) {
        const compareValues = []
        /**
         * @type {Object}
         * @property {*} value_1
         * @property {*} value_2
         * @property {'&&'|'||'} op
         */
        let compareItem = {}

        for (let i = 0; i < branch.if.length; i++) {
          const item = branch.if[i]
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

        isTruthy = operatorCompare(compareValues)
      } else {
        const item = branch.if[0]

        isTruthy = operatorEval({
          name: item.op,
          values: [item.from, item.to]
        })
      }

      if (isTruthy) {
        return processSequence(branch.then, context, payload, blockValues)
      }

      return processSequence(branch.else, context, payload, blockValues)
    }

  },
  setup ({ action }) {
    $action = action
  }
})

const actionDispatch = action.actions.dispatch

export {
  action,
  actionDispatch
}

export default action

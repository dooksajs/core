import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, fetchGetById, operatorCompare, operatorEval } from '#client'
import { getValue } from '@dooksa/utils'

/**
 * @import {SetDataOptions, GetDataQuery, DataSchema, DataWhere} from '../../../types.js'
 * @import {ActionDispatchContext} from '@dooksa/create-action'
 */

/**
 * @typedef {string | string[]} GetValueByQuery - Request to return a specific key value, dot notations are permitted
 */

const dataTypes = {
  object: () => ({}),
  array: () => ([])
}
let $action = (name, param, context, callback) => {
}
// current action in progress
let $actionId = ''

export const action = createPlugin('action', {
  state: {
    schema: {
      blocks: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            ifElse: {
              type: 'boolean'
            },
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
            blockSequence: {
              type: 'string',
              relation: 'action/blockSequences'
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
      }
    }
  },
  metadata: {
    title: 'Action',
    description: 'Dooksa runtime interpreter',
    icon: 'mdi:code-braces-box'
  },
  privateMethods: {
    getBlockValue (id, blockValues) {
      let value = blockValues[id]

      if (!blockValues.hasOwnProperty(id)) {
        const blockData = stateGetValue({
          name: 'action/blocks',
          id
        })

        if (blockData.isEmpty) {
          throw new Error('Action: block could not be found: ' + id)
        }

        value = blockData.item
      }

      return value
    },
    getBlockValueByKey (block, context, payload, blockValues) {
      if (block.hasOwnProperty('blockValues')) {
        return this.getBlockValues(block, context, payload, blockValues)
      }

      const result = {
        key: block.key,
        value: block.value
      }

      if (block.hasOwnProperty('blockValue')) {
        result.value = this.getBlockValue(block.blockValue, blockValues)
      }

      return result
    },
    getBlockValues (block, context, payload, blockValues) {
      let value = dataTypes[block.dataType]()
      const blocks = block.blockValues

      for (let i = 0; i < blocks.length; i++) {
        const id = blocks[i]
        const block = stateGetValue({
          name: 'action/blocks',
          id
        })

        if (block.isEmpty) {
          throw new Error('Action: block could not be found: ' + id)
        }

        const result = this.getBlockValueByKey(block.item, context, payload, blockValues)

        if (result.key) {
          value[result.key] = result.value
        } else {
          value = result.value
        }

        blockValues[id] = value
      }

      return {
        key: block.key,
        value
      }
    },
    processSequence (sequence, context, payload, blockValues = {}, callback, startProcess) {
      const blockProcess = []
      let blockProcessIndex = 0

      for (let i = 0; i < sequence.length; i++) {
        const blockSequenceId = sequence[i]
        const blockSequence = stateGetValue({
          name: 'action/blockSequences',
          id: blockSequenceId
        }).item

        for (let i = 0; i < blockSequence.length; i++) {
          const id = blockSequence[i]
          const block = stateGetValue({
            name: 'action/blocks',
            id
          })

          if (block.isEmpty) {
            throw new Error('Action: block could not be found: ' + id )
          }

          const item = block.item

          // prepare block method
          if (item.method) {
            blockProcess.push(() => {
              const blockResult = this.getBlockValueByKey(block.item, context, payload, blockValues)

              $action(item.method, blockResult.value, {
                context,
                payload,
                blockValues
              }, {
                onSuccess: (result => {
                  const nextProcess = blockProcess[++blockProcessIndex]
                  blockValues[id] = result

                  if (nextProcess) {
                    return nextProcess()
                  }

                  callback()
                }),
                onError: (error) => {
                  /**
                   * @TODO Console error
                   * Until browser support cause @link https://caniuse.com/mdn-javascript_builtins_error_cause_displayed_in_console
                   */
                  if (navigator.userAgent.indexOf('Firefox') === -1) {
                    console.error(error)
                  }

                  // @ts-ignore
                  throw new Error('Broken action block', { cause: error })
                }
              })
            })
          } else if (item.ifElse) {
            blockProcess.push(() => {
              const blockResult = this.getBlockValueByKey(block.item, context, payload, blockValues)
              const processItems = this.ifElse(blockResult.value, callback, {
                context,
                payload,
                blockValues
              })

              // append new process items
              for (let index = 0; index < processItems.length; index++) {
                blockProcess.push(processItems[index])
              }

              const nextProcess = blockProcess[++blockProcessIndex]

              if (nextProcess) {
                return nextProcess()
              }

              callback()
            })
          }
        }
      }

      const nextProcess = blockProcess[blockProcessIndex]

      if (startProcess && typeof nextProcess === 'function') {
        nextProcess()
      }

      return blockProcess
    }
  },
  actions: {
    dispatch: {
      metadata: {
        title: 'Dispatch',
        description: 'Execute an action',
        icon: 'mdi:play-box-multiple'
      },
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            required: true
          },
          context: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              rootId: { type: 'string' },
              parentId: { type: 'string' },
              groupId: { type: 'string' }
            }
          },
          payload: {
            type: 'any'
          },
          clearBlockValues: {
            type: 'boolean'
          }
        }
      },
      /**
       * @param {Object} param
       * @param {string} param.id
       * @param {Object} [param.context]
       * @param {Object} [param.payload]
       * @param {boolean} [param.clearBlockValues]
       * @param {Object} [actionContext]
       * @param {Object} [actionContext.blockValues]
       */
      method ({
        id,
        context,
        payload,
        clearBlockValues
      }, actionContext ) {
        if (clearBlockValues) {
          actionContext.blockValues = {}
        }

        return new Promise((resolve, reject) => {
          const sequence = stateGetValue({
            name: 'action/sequences',
            id,
            options: {
              expand: true
            }
          })

          // attempt to fetch action from backend
          if (sequence.isEmpty) {
            return fetchGetById({
              collection: 'action/sequence',
              id: [id],
              expand: true
            })
              .then(data => {
                if (data.isEmpty) {
                  return reject(new Error('No action found: ' + id))
                }

                // @ts-ignore
                this.dispatch({
                  id,
                  context,
                  payload
                }, actionContext)
                  .then(result => resolve(result))
                  .then(error => reject(error))
              })
              .catch(error => reject(error))
          }

          try {
            DEV: $actionId = id
            this.processSequence(sequence.item, context, payload, actionContext.blockValues, resolve, true)
          } catch (error) {
            reject(error)
          }
        })
      }
    },
    getValue: {
      metadata: {
        title: 'Get action block value',
        description: 'Get value from returned action block value',
        icon: 'mdi:variable-box'
      },
      parameters: {
        type: 'object',
        properties: {
          value: {
            type: 'any'
          },
          query: {
            type: 'string'
          }
        }
      },
      /**
       * Get block value
       * @param {Object} props
       * @param {*} props.value
       * @param {GetValueByQuery} [props.query]
       */
      method (props) {
        if (props.value) {
          return getValue(props.value, props.query)
        }
      }
    },
    getContextValue: {
      metadata: {
        title: 'Get context value',
        description: 'Get value from current context values',
        icon: 'mdi:variable'
      },
      parameters: {
        type: 'string'
      },
      /**
       * Get context value
       * @param {GetValueByQuery} query
       * @param {Object} ctx
       */
      method (query, { context }) {
        return getValue(context, query)
      }
    },
    getPayloadValue: {
      metadata: {
        title: 'Get payload value',
        description: 'Get data from current event payload',
        icon: 'mdi:input'
      },
      parameters: {
        type: 'string'
      },
      /**
       * Get payload value
       * @param {GetValueByQuery} query
       */
      method (query, { payload }) {
        return getValue(payload, query)
      }
    },
    ifElse: {
      metadata: {
        title: 'Condition',
        description: 'The if...else statement executes a action',
        icon: 'mdi:source-branch'
      },
      parameters: {
        type: 'object',
        properties: {
          if: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'any',
                  required: true
                },
                to: {
                  type: 'any'
                },
                op: {
                  type: 'string',
                  required: true
                }
              }
            }
          },
          then: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          else: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      /**
       * Conditional statement to evaluate a condition and execute different blocks of code based on the result.
       * @param {Object} props
       * @param {Object} props.branch - The branch object containing the conditions and corresponding actions.
       * @param {Object[]} props.branch.if - An list of condition evaluate.
       * @param {'=='|'!='|'>'|'>='|'<'|'<='|'!'|'%'|'++'|'--'|'-'|'+'|'*'|'**'|'!!'|'~'} props.branch.if[].op - The operator for the condition (e.g., '==', '>', '<').
       * @param {string|number} props.branch.if[].from - The left-hand side value of the comparison.
       * @param {string|number} props.branch.if[].to - The right-hand side value of the comparison.
       * @param {'&&'|'||'} props.branch.if[].andOr - The logical operator to combine multiple conditions. Valid operators include '&&' (AND) and '||' (OR).
       * @param {number[]} props.branch.then - An list of block sequences to be executed if the condition is true.
       * @param {number[]} props.branch.else - An list of block sequences to be executed if the condition is false.
       * @param {ActionDispatchContext} props.context - The action context in which the action is being performed.
       * @param {*} props.payload - Any additional data required for the action.
       * @param {Object.<string, *>} props.blockValues - Values associated with the current scope.
       */
      method (branch, callback, { context, payload, blockValues }) {
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
            if (item.andOr) {
              compareItem.op = item.andOr
              continue
            }

            const value = operatorEval({
              name: item.op,
              values: [item.from, item.to]
            })

            if (!compareItem.hasOwnProperty('value_1')) {
              compareItem.value_1 = value
            } else {
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
          return this.processSequence(branch.then, context, payload, blockValues, callback)
        }

        return this.processSequence(branch.else, context, payload, blockValues, callback)
      }
    }
  },
  setup ({ action }) {
    $action = action
  }
})

export const {
  actionDispatch,
  actionGetValue,
  actionGetContextValue,
  actionGetPayloadValue,
  actionIfElse
} = action

export default action

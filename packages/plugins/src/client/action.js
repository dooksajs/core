import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, fetchGetById, operatorCompare, operatorEval } from '#client'
import { getValue } from '@dooksa/utils'

/**
 * @import {SetDataOptions, GetDataQuery, DataSchema, DataWhere} from '../../../types.js'
 * @import {ActionDispatchContext, ActionBlock} from '@dooksa/create-action'
 */

/**
 * @typedef {string | string[]} GetValueByQuery - Request to return a specific key value, dot notations are permitted
 */

const dataTypes = {
  object: () => ({}),
  array: () => ([])
}
let $action = (name, param, context, callback) => {
  throw new Error('Action: $action method was not defined during setup')
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
    /**
     * Processes a sequence of action block sequences, executing blocks in order
     * and managing asynchronous execution flow.
     *
     * @param {string[]} sequence - Array of block sequence IDs to process. Each sequence ID
     *   references a collection of block IDs that will be executed in order.
     * @param {ActionDispatchContext} context - Current action execution context containing
     *   id, rootId, parentId, and groupId information.
     * @param {Object} payload - Data payload passed to action methods for processing.
     * @param {Object} [blockValues={}] - Accumulated values from previously executed blocks.
     *   Used to cache and share values between blocks during execution.
     * @param {Function} [callback] - Completion callback called when all blocks are processed.
     *   Receives the final result of the action execution.
     * @param {boolean} [startProcess=false] - Whether to immediately start execution.
     *   If false, returns prepared functions for manual execution.
     * @returns {Function[]} Array of prepared block execution functions that can be
     *   executed sequentially.
     * @throws {Error} When block sequences cannot be found in state.
     * @throws {Error} When individual blocks within sequences cannot be found.
     * @throws {Error} When action method execution fails (via onError handler).
     * @throws {Error} When block value retrieval fails.
     */
    processSequence (sequence, context, payload, blockValues = {}, callback, startProcess) {
      const blockProcess = []
      let blockProcessIndex = 0

      // Validate sequence input
      if (!Array.isArray(sequence)) {
        throw new Error(`Action: sequence must be an array, received ${typeof sequence}`)
      }

      for (let i = 0; i < sequence.length; i++) {
        const blockSequenceId = sequence[i]

        // Get block sequence with proper empty checking
        const blockSequenceResult = stateGetValue({
          name: 'action/blockSequences',
          id: blockSequenceId
        })

        if (blockSequenceResult.isEmpty) {
          throw new Error(`Action: block sequence could not be found: ${blockSequenceId} (sequence index: ${i})`)
        }

        const blockSequence = blockSequenceResult.item

        for (let j = 0; j < blockSequence.length; j++) {
          const id = blockSequence[j]

          // Get block with proper empty checking
          const blockResult = stateGetValue({
            name: 'action/blocks',
            id
          })

          if (blockResult.isEmpty) {
            throw new Error(`Action: block could not be found: ${id} (sequence: ${blockSequenceId}, position: ${j})`)
          }

          const block = blockResult.item

          // prepare block method
          if (block.method) {
            blockProcess.push(() => {
              try {
                const blockResult = this.getBlockValueByKey(block, context, payload, blockValues)

                $action(block.method, blockResult.value, {
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
                      // console.error(error)
                    }

                    // Enhance error with context
                    const enhancedError = new Error(`Action method '${block.method}' failed for block '${id}': ${error.message}`)
                    // @ts-ignore
                    enhancedError.cause = error
                    // @ts-ignore
                    enhancedError.blockId = id
                    // @ts-ignore
                    enhancedError.method = block.method
                    throw enhancedError
                  }
                })
              } catch (error) {
                // Catch synchronous errors from getBlockValueByKey
                const enhancedError = new Error(`Action block preparation failed for '${id}': ${error.message}`)
                // @ts-ignore
                enhancedError.cause = error
                // @ts-ignore
                enhancedError.blockId = id
                throw enhancedError
              }
            })
          } else if (block.ifElse) {
            blockProcess.push(() => {
              try {
                const blockResult = this.getBlockValueByKey(block, context, payload, blockValues)
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
              } catch (error) {
                // Enhance error with context
                const enhancedError = new Error(`Action ifElse condition failed for block '${id}': ${error.message}`)
                // @ts-ignore
                enhancedError.cause = error
                // @ts-ignore
                enhancedError.blockId = id
                throw enhancedError
              }
            })
          } else {
            // Warn about blocks with no recognized action type
            console.warn(`Action: block ${id} has no recognized action type (no method or ifElse)`)

            if (typeof callback === 'function') {
              callback()
            }
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

        // handle multiple conditions joined by '&&' or '||'
        if (branch.if.length > 1) {
          const compareValues = []
          /**
           * Stores a single condition pair to be evaluated
           * @type {Object}
           * @property {*} value_1 - the result of evaluating the first operand
           * @property {*} value_2 - the result of evaluating the second operand (only after an operator is defined)
           * @property {'&&'|'||'} op - logical operator ('&&' or '||') used to combine conditions
           */
          let compareItem = {}

          for (let i = 0; i < branch.if.length; i++) {
            const item = branch.if[i]

            // if the current condition has a logical operator, store it for combining later.
            if (item.andOr) {
              compareItem.op = item.andOr
              continue
            }

            // evaluate the comparison using the provided operator and operands.
            const value = operatorEval({
              name: item.op,
              values: [item.from, item.to]
            })

            // initialise first operand for a new condition pair.
            if (!compareItem.hasOwnProperty('value_1')) {
              compareItem.value_1 = value
            } else {
              // if we already have a value_1 and an operator is defined, complete the condition pair.
              if (!compareItem.op) {
                throw new Error('Condition expects an operator')
              }

              compareItem.value_2 = value
              compareValues.push(compareItem)

              // reset for next condition.
              compareItem = {}
            }
          }

          // evaluate all grouped conditions using logical operators (e.g., AND or OR between groups)
          isTruthy = operatorCompare(compareValues)
        } else {
          // handle single condition: evaluate directly without grouping
          const item = branch.if[0]

          isTruthy = operatorEval({
            name: item.op,
            values: [item.from, item.to]
          })
        }

        // if the condition evaluates to true, execute the 'then' block sequence
        if (isTruthy) {
          return this.processSequence(branch.then, context, payload, blockValues, callback)
        }

        // otherwise, execute the 'else' block sequence
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

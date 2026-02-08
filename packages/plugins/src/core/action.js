import { createPlugin } from '@dooksa/create-plugin'
import { apiGetById, operatorCompare, operatorEval, stateGetValue } from '#core'
import { getValue } from '@dooksa/utils'
import { lazyLoader } from '../lazy/index.js'

/**
 * @import {SetDataOptions, GetDataQuery, DataSchema, DataWhere, GetValueByQuery} from '../../../types.js'
 * @import {ActionDispatchContext, ActionBlock} from '@dooksa/create-action'
 */

const dataTypes = {
  object: () => ({}),
  array: () => ([])
}
// current action in progress
let $actionId = ''

export const action = createPlugin('action', {
  data: {
    /** @type {Object.<string, Function>} */
    actions: {},
    /** @type {Function} */
    lazyLoader: null
  },
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
    /**
     * Helper function to resolve values from context/payload
     * @param {*} context
     * @param {*} payload
     * @param {*} value
     */
    resolveValue (context, payload, value) {
      // If it's a string that looks like a path, try to resolve it
      if (typeof value === 'string') {
        // Try context first
        const contextValue = getValue(context, value)
        if (contextValue != undefined) {
          return contextValue
        }
        // Try payload
        const payloadValue = getValue(payload, value)
        if (payloadValue != undefined) {
          return payloadValue
        }
      }
      // Return as-is if not a path or not found
      return value
    },
    /**
     * Callback function that loads plugins when actions are needed.
     * This method ensures that the requested action method is available before executing the callback.
     * If the action is not immediately available, it attempts to lazy load it.
     *
     * @param {string} name - Name of the action method to ensure is available
     * @param {function} callback - Function to execute after plugin is loaded
     * @returns {any} Result of the callback function
     * @throws {Error} When no action found with the specified name
     * @example
     * // Ensure auth plugin is loaded before calling login
     * actionCallback('auth_login', () => {
     *   return app.actions.auth_login(credentials)
     * })
     */
    callWhenAvailable (name, callback) {
      if (typeof this.actions[name] === 'function') {
        return callback()
      }

      if (typeof this.lazyLoader === 'function') {
        this.lazyLoader(name, callback)
      }

      throw new Error('Action: no action found "' + name +'"')
    },
    /**
     * Calls a specific action method by name, handling both synchronous and asynchronous execution.
     * This method ensures the action is available before calling it and manages the execution flow.
     *
     * @param {string} name - Name of the action method to call
     * @param {Object|undefined} params - Parameters to pass to the action method
     * @param {Object} context - Context object containing execution context and data
     * @param {ActionDispatchContext} context.context - Current action execution context containing
     *   id, rootId, parentId, and groupId information for tracking execution flow
     * @param {Object} context.payload - Data payload passed to action methods for processing
     * @param {Object} [context.blockValues={}] - Accumulated values from previously executed blocks.
     *   Used to cache and share values between blocks during execution
     * @param {Object} callback - Callback handlers for handling success and error cases
     * @param {function} [callback.onSuccess] - Function to call when action executes successfully
     * @param {function} [callback.onError] - Function to call when action execution fails
     * @returns {any} Result of the callback function execution
     * @throws {Error} When action method is not found or execution fails
     * @example
     * // Call an action method with callback handlers
     * action.call('auth_login', credentials, context, {
     *   onSuccess: (result) => console.log('Login successful', result),
     *   onError: (error) => console.error('Login failed', error)
     * })
     */
    call (name, params, context, callback = {}) {
      if (!params) {
        params = {}
      }

      this.callWhenAvailable(name, () => {
        const result = this.actions[name](params, context)
        const onSuccess = callback.onSuccess
        const onError = callback.onError

        if (result instanceof Error) {
          onError(result)
        } else if (result instanceof Promise) {
          Promise.resolve(result)
            .then(results => {
              onSuccess(results)
            })
            .catch(error => {
              onError(error)
            })
        } else {
          onSuccess(result)
        }
      })
    },
    /**
     * Retrieves the value of a specific action block from the cache or state.
     * If the block value is not cached, it fetches it from the state and caches it.
     *
     * @param {string} id - The unique identifier of the action block to retrieve
     * @param {Object} blockValues - Cache object containing previously retrieved block values
     * @returns {Object} The block value object retrieved from cache or state
     * @throws {Error} When the block cannot be found in state
     * @example
     * // Get a block value from cache or fetch from state
     * const blockValue = action.getBlockValue('block_123', blockValuesCache)
     */
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
    /**
     * Retrieves a block value by key, handling both single values and collections.
     * This method determines whether to process a single block value or multiple block values
     * based on the block structure.
     *
     * @param {Object} block - The action block object containing value information
     * @param {string} [block.key] - Optional key to identify the value in a collection
     * @param {*} [block.value] - Direct value if no block references exist
     * @param {string} [block.blockValue] - Reference to a single block value to retrieve
     * @param {string[]} [block.blockValues] - Array of block references for collection values
     * @param {ActionDispatchContext} context - Current action execution context
     * @param {Object} payload - Data payload for the action
     * @param {Object} blockValues - Cache of previously retrieved block values
     * @returns {{key: string|undefined, value: any}} Object containing the key and resolved value
     * @throws {Error} When referenced blocks cannot be found
     * @example
     * // Get a single block value
     * const result = action.getBlockValueByKey(
     *   { blockValue: 'block_123' },
     *   context,
     *   payload,
     *   blockValues
     * )
     */
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
    /**
     * Processes a collection of block values and combines them into a single value object.
     * This method handles multiple block references and builds a composite value based on
     * the specified data type (object or array).
     *
     * @param {Object} block - The parent block containing the collection configuration
     * @param {string} [block.key] - Optional key for the resulting value in parent context
     * @param {string} block.dataType - Type of data structure to create ('object' or 'array')
     * @param {string[]} block.blockValues - Array of block IDs to process
     * @param {Object} context - Current action execution context
     * @param {ActionDispatchContext} context.context - Context with id, rootId, parentId, groupId
     * @param {Object} payload - Data payload for the action
     * @param {Object} blockValues - Cache of previously retrieved block values
     * @returns {{key: string|undefined, value: Object|Array}} Object containing the key and combined value
     * @throws {Error} When any referenced block cannot be found
     * @example
     * // Combine multiple block values into an object
     * const result = action.getBlockValues(
     *   { dataType: 'object', blockValues: ['block_1', 'block_2'] },
     *   context,
     *   payload,
     *   blockValues
     * )
     */
    getBlockValues (block, context, payload, blockValues) {
      let newValue = dataTypes[block.dataType]()
      const blocks = block.blockValues

      for (let i = 0; i < blocks.length; i++) {
        const id = blocks[i]
        const blockData = stateGetValue({
          name: 'action/blocks',
          id
        })

        if (blockData.isEmpty) {
          throw new Error('Action: block could not be found: ' + id)
        }

        const { key, value } = this.getBlockValueByKey(blockData.item, context, payload, blockValues)

        if (key) {
          newValue[key] = value
        } else {
          newValue = value
        }

        blockValues[id] = value
      }

      return {
        key: block.key,
        value: newValue
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

                this.call(block.method, blockResult.value, {
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

                    callback(result)
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

                // errorLogError({
                //   message: `Action block preparation failed for '${id}': ${error.message}`,
                //   level: 'ERROR'
                // })

                throw error
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
                for (let i = 0; i < processItems.length; i++) {
                  blockProcess.push(processItems[i])
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

      if (startProcess) {
        if (typeof nextProcess === 'function') {
          nextProcess()
        } else if (typeof callback === 'function') {
          callback()
        }
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
       * Dispatches an action by executing its sequence of blocks.
       * This method handles both immediate execution and lazy loading of action sequences from the backend.
       *
       * @param {Object} param - Parameters for the action dispatch
       * @param {string} param.id - Unique identifier of the action sequence to execute
       * @param {Object} [param.context] - Execution context containing id, rootId, parentId, groupId
       * @param {Object} [param.payload] - Data payload to pass to action methods
       * @param {boolean} [param.clearBlockValues] - Whether to clear cached block values before execution
       * @param {Object} [actionContext={}] - Internal execution context
       * @param {Object} [actionContext.blockValues] - Cache of previously executed block values
       * @returns {Promise<any>} Promise that resolves with the result of the action execution
       * @throws {Error} When action sequence cannot be found or execution fails
       * @example
       * // Execute an action with context and payload
       * const result = await action.dispatch({
       *   id: 'user_login',
       *   context: { id: 'session_123', rootId: 'app_1' },
       *   payload: { username: 'user', password: 'pass' }
       * }, { blockValues: {} })
       */
      method ({
        id,
        context,
        payload,
        clearBlockValues
      }, actionContext = {} ) {
        return new Promise((resolve, reject) => {
          if (clearBlockValues) {
            for (const key in actionContext.blockValues) {
              delete actionContext.blockValues[key]
            }
          }

          // fetch sequence and sync related data
          const sequence = stateGetValue({
            name: 'action/sequences',
            id,
            options: {
              expand: true
            }
          })

          // attempt to get action from backend
          if (sequence.isEmpty) {
            return apiGetById({
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
                  .catch(error => reject(error))
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
       * Retrieves a value from an action block result using an optional query path.
       * This method allows accessing nested properties within block execution results.
       *
       * @param {Object} props - Parameters for retrieving the value
       * @param {*} props.value - The value to query (typically from a block execution result)
       * @param {GetValueByQuery} [props.query] - Optional query string or array for nested property access
       * @returns {*} The retrieved value or undefined if not found
       * @example
       * // Get a nested property from a block result
       * const username = action.getValue({
       *   value: { user: { name: 'John', age: 30 } },
       *   query: 'user.name'
       * }) // Returns 'John'
       *
       * // Get the entire value if no query
       * const result = action.getValue({ value: { data: 'test' } })
       * // Returns { data: 'test' }
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
       * Retrieves a value from the current action execution context using a query path.
       * This method provides access to context data such as session information, user data, etc.
       *
       * @param {GetValueByQuery} query - Query string or array for nested property access within context
       * @param {Object} ctx - Context object containing execution data
       * @param {ActionDispatchContext} ctx.context - Current action execution context
       * @returns {*} The retrieved value from context or undefined if not found
       * @example
       * // Get user ID from context
       * const userId = action.getContextValue('context.user.id', { context })
       *
       * // Get entire context object
       * const fullContext = action.getContextValue('', { context })
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
       * Retrieves a value from the current action payload using a query path.
       * This method provides access to data passed to the action, such as form inputs or event data.
       *
       * @param {GetValueByQuery} query - Query string or array for nested property access within payload
       * @param {Object} ctx - Context object containing payload data
       * @param {Object} ctx.payload - Current action payload containing event or request data
       * @returns {*} The retrieved value from payload or undefined if not found
       * @example
       * // Get form input value from payload
       * const username = action.getPayloadValue('formData.username', { payload })
       *
       * // Get entire payload object
       * const fullPayload = action.getPayloadValue('', { payload })
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
                left: {
                  type: 'any',
                  required: true
                },
                right: {
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
       * This method supports both single and multiple conditions with logical operators (AND/OR).
       *
       * @param {Object} branch - The branch object containing the conditions and corresponding actions
       * @param {Object[]} branch.if - Array of condition objects to evaluate
       * @param {'=='|'!='|'>'|'>='|'<'|'<='|'!'|'%'|'++'|'--'|'-'|'+'|'*'|'**'|'!!'|'~'} branch.if[].op - The operator for the condition
       * @param {string|number} branch.if[].left - The left-hand side value of the comparison
       * @param {string|number} branch.if[].right - The right-hand side value of the comparison
       * @param {'&&'|'||'} [branch.if[].andOr] - Logical operator to combine multiple conditions ('&&' for AND, '||' for OR)
       * @param {string[]} branch.then - Array of block sequence IDs to execute if condition is true
       * @param {string[]} branch.else - Array of block sequence IDs to execute if condition is false
       * @param {Function} callback - Completion callback to call after processing
       * @param {Object} context - Current execution context
       * @param {ActionDispatchContext} context.context - Action execution context with id, rootId, parentId, groupId
       * @param {Object} context.payload - Data payload for the action
       * @param {Object} context.blockValues - Cache of previously executed block values
       * @returns {Function[]} Array of prepared block execution functions
       * @throws {Error} When condition structure is invalid or operator is missing
       * @example
       * // Single condition
       * action.ifElse({
       *   if: [{ op: '==', left: 'user.role', right: 'admin' }],
       *   then: ['admin_sequence'],
       *   else: ['user_sequence']
       * }, callback, { context, payload, blockValues })
       *
       * // Multiple conditions with AND
       * action.ifElse({
       *   if: [
       *     { op: '==', left: 'user.role', right: 'admin' },
       *     { andOr: '&&' },
       *     { op: '>', left: 'user.age', right: 18 }
       *   ],
       *   then: ['adult_admin_sequence'],
       *   else: ['other_sequence']
       * }, callback, { context, payload, blockValues })
       */
      method (branch, callback, { context, payload, blockValues } = {
        context: {},
        payload: {},
        blockValues: {}
      }) {
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

            // Resolve values before evaluation
            const leftValue = this.resolveValue(context, payload, item.left)
            const rightValue = this.resolveValue(context, payload, item.right)

            // evaluate the comparison using the provided operator and operands.
            const value = operatorEval({
              name: item.op,
              values: [leftValue, rightValue]
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

          // Resolve values before evaluation
          const leftValue = this.resolveValue(context, payload, item.left)
          const rightValue = this.resolveValue(context, payload, item.right)

          isTruthy = operatorEval({
            name: item.op,
            values: [leftValue, rightValue]
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
  /**
   * Sets up the action plugin with external action methods and lazy loading capability.
   * This method validates and registers action methods for use in the action system.
   *
   * @param {Object} options - Configuration options for setup
   * @param {Object.<string, Function>} options.actions - Object map of action names to action functions
   * @param {Function} [options.lazyLoadAction] - Optional function for lazy loading actions when needed
   * @throws {Error} When any action method is not a function
   * @example
   * // Setup with action methods
   * action.setup({
   *   actions: {
   *     'auth_login': (params, context) => { /* login logic *\/ },
   *     'data_save': (params, context) => { /* save logic *\/ }
   *   },
   *   lazyLoadAction: (actionName, callback) => {
   *     // Load action plugin dynamically
   *     loadPlugin(actionName).then(() => callback())
   *   }
   * })
   */
  setup ({ actions, lazyLoadAction }) {
    for (const key in actions) {
      if (!actions.hasOwnProperty(key)) continue

      if (typeof actions[key] !== 'function') {
        throw new Error(`Action: unexpected type "${typeof actions[key]}" for "${key}"`)
      }
    }

    this.actions = actions

    if (typeof lazyLoadAction === 'function') {
      this.lazyLoader = lazyLoadAction
    } else {
      // this.lazyLoader = lazyLoader
    }
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

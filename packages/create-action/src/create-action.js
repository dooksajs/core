import { hash } from '@dooksa/utils'
import availableMethods from './available-methods.js'
import { parseAction } from '@dooksa/utils/server'

/**
 * @import {ActionValue, Action, ActionBlock, ParseOptions} from '../types/index.js'
 */

/**
 * Creates a compiled action from raw action data.
 *
 * This function orchestrates the entire action compilation process by:
 * 1. Processing each action item through parseAction to convert to block format
 * 2. Managing block sequences and execution order
 * 3. Resolving references ($ref and $sequenceRef) between blocks
 * 4. Generating unique block IDs using hash-based prefixes
 *
 * ## Process Flow
 *
 * 1. **Input**: Array of action data objects
 * 2. **Parsing**: Each item is parsed into blocks with unique IDs
 * 3. **Reference Resolution**: $ref and $sequenceRef are resolved to actual block IDs
 * 4. **Output**: Compiled action with blocks, sequences, and dependencies
 *
 * ## Reference Resolution
 *
 * - **$ref**: Resolves to specific block IDs within the compiled action
 * - **$sequenceRef**: Resolves to sequence IDs (block sequences)
 * - References can use numeric indices or named action IDs
 *
 * @example
 * // Basic ifElse conditional with meaningful names
 * const conditionalAction = createAction('user-validation', [
 *   {
 *     action_ifElse: {
 *       if: [{
 *         op: '==',
 *         left: { action_getPayloadValue: 'isValid' },
 *         right: true
 *       }],
 *       then: [{ $sequenceRef: 'handleSuccess' }],
 *       else: [{ $sequenceRef: 'handleFailure' }]
 *       }
 *   },
 *   {
 *     $id: 'handleSuccess',
 *     action_dispatch: { id: 'show-success-message' }
 *   },
 *   {
 *     $id: 'handleFailure',
 *     action_dispatch: { id: 'show-error-message' }
 *   }
 * ], {
 *   action_dispatch: true,
 *   action_getPayloadValue: true
 * })
 *
 * @example
 * // Simple action sequence
 * const processData = createAction('process-data', [
 *   {
 *     $id: 'fetchInput',
 *     action_getPayloadValue: 'data'
 *   },
 *   {
 *     $id: 'transformData',
 *     action_getValue: {
 *       value: { $ref: 'fetchInput' },
 *       query: 'value'
 *     }
 *   },
 *   {
 *     state_setValue: {
 *       name: 'result',
 *       value: { $ref: 'transformData' }
 *     }
 *   }
 * ], {
 *   action_getPayloadValue: true,
 *   action_getValue: true,
 *   state_setValue: true
 * })
 *
 * @example
 * // Action with dependencies
 * const userAction = createAction('handle-user-action', [
 *   {
 *     $id: 'validateUser',
 *     action_validate: { minLength: 3 }
 *   },
 *   {
 *     $id: 'processUser',
 *     action_process: {
 *       input: { $ref: 'validateUser' }
 *     }
 *   }
 * ], ['user-plugin', 'validation-plugin'], {
 *   action_validate: true,
 *   action_process: true
 * })
 *
 * @overload
 * @param {string} id - Unique identifier for the action.
 * @param {ActionValue[]} data - Array of action data objects to compile.
 *
 * @overload
 * @param {string} id - Unique identifier for the action.
 * @param {ActionValue[]} data - Array of action data objects to compile.
 * @param {string[]} dependencies - Array of plugin or action dependencies.
 *
 * @overload
 * @param {string} id - Unique identifier for the action.
 * @param {ActionValue[]} data - Array of action data objects to compile.
 * @param {string[]} dependencies - Array of plugin or action dependencies.
 * @param {Object.<string, boolean>} methods - Allowed action method names.
 *
 * @returns {Action} Compiled action object containing:
 *   - `id`: The action identifier
 *   - `blocks`: Object mapping block IDs to block definitions
 *   - `blockSequences`: Object mapping sequence IDs to arrays of block IDs
 *   - `sequences`: Array of sequence IDs in execution order
 *   - `dependencies`: Array of required dependencies
 *
 */
function createAction (...args) {
  const id = args[0]
  const data = args[1]

  let methods
  /** @type {string[]} */
  let dependencies = []
  let arg2 = args[2]
  let arg3 = args[3]

  if (typeof arg2 === 'object') {
    if (Array.isArray(arg2)) {
      dependencies = arg2
    } else {
      // add methods if dependencies is excluded
      methods = arg2
    }
  }

  // set methods
  if (typeof arg3 === 'object') {
    methods = arg3
  }

  const sequences = []
  /** @type {Object.<string, string[]>} */
  const blockSequences = {}
  const blockIndexes = {}
  let sequenceRefs = []
  /** @type {Object.<string, ActionBlock>} */
  let blocks = {}

  if (methods) {
    Object.assign(methods, availableMethods)
  } else {
    methods = { ...availableMethods }
  }

  const actionId = {
    prefix: hash.update(id),
    increment: 1
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const action = parseAction(item, methods, actionId)
    const blockSequenceId = actionId.prefix + '_' + ++actionId.increment

    if (action.id) {
      blockIndexes[action.id] = blockSequenceId
    }

    blockSequences[blockSequenceId] = action.blockSequences
    Object.assign(blocks, action.blocks)
    sequences.push(blockSequenceId)

    if (action.$sequenceRefs.length) {
      sequenceRefs = sequenceRefs.concat(action.$sequenceRefs)
    }

    for (let i = 0; i < action.$refs.length; i++) {
      const [blockId, index] = action.$refs[i]
      let blockSequenceId = blockIndexes[index]

      // handle $ref referencing an index number
      if (typeof index === 'number') {
        if (index >= sequences.length) {
          throw new Error('$ref is outside the block sequence')
        }

        blockSequenceId = sequences[index]
      }

      const block = blocks[blockId]
      const blockSequence = blockSequences[blockSequenceId]

      // add ref block id
      block.blockValue = blockSequence[blockSequence.length - 1]
      // remove ref
      // @ts-ignore
      delete block.$ref
    }
  }

  for (let i = 0; i < sequenceRefs.length; i++) {
    const [blockId, index] = sequenceRefs[i]
    const block = blocks[blockId]
    let blockValue = blockIndexes[index]

    if (typeof index === 'number') {
      blockValue = sequences[index]
    }

    // update ref value
    block.value = blockValue
    //@ts-ignore
    delete block.$sequenceRef
  }

  return {
    id,
    blocks,
    blockSequences,
    sequences,
    dependencies
  }
}

export default createAction

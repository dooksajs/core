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
 * @example
 * // Create a simple action with dispatch
 * const action = createAction('my-action', [
 *   {
 *     action_dispatch: {
 *       id: 'component-123',
 *       payload: { value: 'Hello' }
 *     }
 *   }
 * ], [], { action_dispatch: true })
 *
 * @example
 * // Create action with references
 * const action = createAction('ref-action', [
 *   {
 *     $id: 'step1',
 *     action_dispatch: { id: 'comp1' }
 *   },
 *   {
 *     state_setValue: {
 *       name: 'test',
 *       value: { $ref: 'step1' }
 *     }
 *   }
 * ], [], { action_dispatch: true, state_setValue: true })
 *
 * @example
 * // Create action with dependencies
 * const action = createAction('complex-action', [
 *   {
 *     action_ifElse: {
 *       if: [{ op: '==', left: 'status', right: 'active' }],
 *       then: [{ $sequenceRef: 0 }],
 *       else: [{ $sequenceRef: 1 }]
 *     }
 *   }
 * ], ['plugin-a', 'plugin-b'], { action_ifElse: true })
 */
function createAction (...args) {
  const id = args[0]
  const data = args[1]

  let methods, dependencies
  let arg2 = args[2]
  let arg3 = args[3]

  if (typeof arg2 === 'object') {
    dependencies = arg2

    if (!Array.isArray(arg2)) {
      // add methods if dependencies is excluded
      methods = arg2
      dependencies = null
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

    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i]

      if (blockValue === sequence) {
        sequences.splice(i, 1)
        break
      }
    }

    // update ref value
    block.value = blockValue
    // delete unused property
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

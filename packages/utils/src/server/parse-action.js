/**
 * @import {ActionValue} from '../../../create-action/src/types.js'
 */

/**
 * Parses action data into a structured block-based format with unique identifiers.
 *
 * This function recursively processes action objects and converts them into blocks that can be
 * executed by the action system. It handles special properties like $id, $ref, and $sequenceRef,
 * and organizes blocks into sequences for execution order.
 *
 * @param {ActionValue} data - The action data object to parse. Contains action methods and their parameters
 * @param {Object.<string, boolean>} methods - Object mapping of available action method names to true
 * @param {Object} uuid - Object containing UUID generation state
 * @param {string} uuid.prefix - Prefix string for generating unique block IDs
 * @param {number} uuid.increment - Incrementing counter for unique block IDs
 * @param {Object} [blocks={}] - Accumulator object for storing parsed blocks (key: blockId, value: block)
 * @param {Object} [parentBlock] - Parent block reference for nesting blocks
 * @param {string[]} [blockSequences=[]] - Array of block IDs in execution order
 * @param {string} [dataType] - Current data type being processed (e.g., 'array', 'object')
 * @param {Object[]} [$refs=[]] - Array of [blockId, refValue] tuples for $ref resolution
 * @param {Object[]} [$sequenceRefs=[]] - Array of [blockId, refValue] tuples for $sequenceRef resolution
 * @param {boolean} [isHead=true] - Flag indicating if this is the root-level parse call
 * @returns {Object|undefined} Returns the parsed result object when isHead=true, containing:
 *   - `$sequenceRefs`: Array of sequence reference tuples
 *   - `$refs`: Array of reference tuples
 *   - `id`: The action ID if $id was specified
 *   - `blocks`: Object mapping block IDs to block definitions
 *   - `blockSequences`: Array of block IDs in execution order
 *
 * @example
 * // Basic action with dispatch
 * const data = {
 *   $id: 'my-action',
 *   action_dispatch: {
 *     id: 'component-123',
 *     payload: {
 *       value: 'Hello World'
 *     }
 *   }
 * }
 *
 * const methods = { action_dispatch: true }
 * const uuid = { prefix: 'abc123', increment: 0 }
 *
 * const result = parseAction(data, methods, uuid)
 * // Result:
 * // {
 * //   id: 'my-action',
 * //   blocks: {
 * //     'abc123_1': {
 * //       method: 'action_dispatch',
 * //       blockValues: ['abc123_2']
 * //     },
 * //     'abc123_2': {
 * //       key: 'id',
 * //       value: 'component-123'
 * //     },
 * //     'abc123_3': {
 * //       key: 'payload',
 * //       dataType: 'object',
 * //       blockValues: ['abc123_4']
 * //     },
 * //     'abc123_4': {
 * //       key: 'value',
 * //       value: 'Hello World'
 * //     }
 * //   },
 * //   blockSequences: ['abc123_1'],
 * //   $refs: [],
 * //   $sequenceRefs: []
 * // }
 *
 * @example
 * // Action with references and sequences
 * const data = {
 *   action_ifElse: {
 *     if: [
 *       { op: '==', from: 'value', to: 'active' }
 *     ],
 *     then: [{ $sequenceRef: 0 }],
 *     else: [{ $sequenceRef: 1 }]
 *   }
 * }
 *
 * const methods = { action_ifElse: true, state_setValue: true }
 * const uuid = { prefix: 'xyz789', increment: 0 }
 *
 * const result = parseAction(data, methods, uuid)
 * // Result includes blocks for the ifElse condition and sequence references
 */
function parseAction (
  data,
  methods,
  uuid,
  blocks = {},
  parentBlock,
  blockSequences = [],
  dataType,
  $sequenceRefs = [],
  $refs = [],
  isHead = true
) {
  // Store intermediate results during parsing
  const results = []
  // Track the action ID if specified
  let id

  // Process each key-value pair in the input data
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const item = data[key]
      const block = {}
      const result = { block }

      // Handle special $id property at the root level
      if (key === '$id' && isHead) {
        id = item
        delete item.$id
        continue
      }

      // Handle $ref - creates a reference to another block's value
      if (key === '$ref') {
        parentBlock.$ref = item
        // Remove conflicting properties since $ref replaces them
        delete parentBlock.dataType
        delete parentBlock.blockValues
        break
      }

      // Handle $sequenceRef - creates a reference to a block sequence
      if (key === '$sequenceRef') {
        parentBlock.$sequenceRef = item
        // Remove conflicting properties since $sequenceRef replaces them
        delete parentBlock.dataType
        delete parentBlock.blockValues
        break
      }

      // Check if this key is an action method that creates a block sequence
      if (methods[key]) {
        result.isBlockSequence = true
        block.method = key
      } else if (key === 'action_ifElse') {
        // Special case for ifElse blocks
        result.isBlockSequence = true
        block.ifElse = true
      }

      // For nested properties (not at root), add the key to the block
      if (!isHead && !result.isBlockSequence) {
        block.key = key
      }

      // Handle nested objects/arrays recursively
      if (typeof item === 'object') {
        if (Array.isArray(item)) {
          // Arrays get a special dataType and blockValues array
          block.dataType = 'array'
          block.blockValues = []
        } else {
          // Objects need to check if they contain method calls
          const keys = Object.keys(item)

          if (!methods[keys[0]]) {
            // Plain object with properties
            block.dataType = 'object'
            block.blockValues = []
          } else {
            // Object containing method calls
            block.blockValue = true
          }
        }

        // Update current dataType and recurse
        dataType = block.dataType
        parseAction(item, methods, uuid, blocks, block, blockSequences, dataType, $sequenceRefs, $refs, false)
      } else if (item !== '$null') {
        // Handle primitive values (except $null which is a special marker)
        block.value = item
      }

      results.push(result)
    }
  }

  // Process all collected results to create final blocks
  for (let i = 0; i < results.length; i++) {
    const item = results[i]
    // Generate unique block ID
    const blockId = uuid.prefix + '_' + ++uuid.increment

    // Handle $ref references
    if (item.block.hasOwnProperty('$ref')) {
      $refs.push([blockId, item.block.$ref])
    }

    // Handle $sequenceRef references
    if (item.block.hasOwnProperty('$sequenceRef')) {
      $sequenceRefs.push([blockId, item.block.$sequenceRef])
    }

    // Link this block to its parent
    if (parentBlock) {
      if (parentBlock.blockValues) {
        // Add to array of child block IDs
        parentBlock.blockValues.push(blockId)
      } else if (parentBlock.blockValue) {
        // Set as single child block ID
        parentBlock.blockValue = blockId
      }
    }

    // Track block sequences for execution order
    if (item.isBlockSequence) {
      blockSequences.push(blockId)
    }

    // Store the block with its unique ID
    blocks[blockId] = item.block
  }

  // Return complete result only at the root level
  if (isHead) {
    return {
      $sequenceRefs,
      $refs,
      id,
      blocks,
      blockSequences
    }
  }
}

export default parseAction

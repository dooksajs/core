/** @import { ActionBlock, BlockReference } from '../types/index.js' **/

import { deepClone, objectHash } from '@dooksa/utils'

/**
 * @typedef {Object} CompileBlock
 * @description Enhanced block structure for compilation phase
 * @property {string} [key] - Property name for the block
 * @property {string} [method] - Action method name
 * @property {string} [dataType] - Data type ('array', 'object', etc.)
 * @property {string} [value] - Primitive value
 * @property {string} [blockValue] - Single child block reference
 * @property {string[]} [blockValues] - Array of child block references
 * @property {boolean} [ifElse] - Flag for conditional blocks
 * @property {string} [blockSequence] - Associated block sequence ID
 */

/**
 * Recursively hashes a block and its nested block references, building a collection
 * of unique hashed blocks. This function handles both single blockValue and multiple
 * blockValues properties, recursively processing nested blocks and updating references.
 *
 * This is a core function in the compilation process that ensures:
 * - Each block gets a unique hash-based ID
 * - Nested block references are updated to use new hashed IDs
 * - Duplicate blocks are eliminated through hashing
 *
 * @param {CompileBlock} block - The block object to hash
 * @param {Object.<string, CompileBlock>} sourceBlock - Source blocks collection to look up nested references
 * @param {Object.<string, CompileBlock>} targetBlock - Target blocks collection to store hashed blocks
 * @param {Object.<string, string>} collection - Collection mapping original block IDs to their hashed IDs
 * @returns {string} The hashed block ID (object hash of the block content)
 */
function hashBlock (block, sourceBlock, targetBlock, collection) {
  block = deepClone(block)

  if (block.blockValue) {
    const blockId = hashBlock(sourceBlock[block.blockValue], sourceBlock, targetBlock, collection)

    collection[block.blockValue] = blockId
    block.blockValue = blockId
  } else if (block.blockValues) {
    for (let i = 0; i < block.blockValues.length; i++) {
      const id = block.blockValues[i]
      const blockId = hashBlock(sourceBlock[id], sourceBlock, targetBlock, collection)

      collection[id] = blockId
      block.blockValues[i] = blockId
    }
  }

  const blockId = objectHash(block)

  targetBlock[blockId] = block

  return blockId
}

/**
 * @import { ActionCompileResult, ActionCompileBlock } from '../types/index.js'
 */

/**
 * Compiles an action by processing its sequences, blocks, and handling if-else logic.
 *
 * This function performs the final compilation step in the action pipeline:
 * 1. **Hashing**: Converts all block IDs to hash-based unique identifiers
 * 2. **Deduplication**: Eliminates duplicate blocks through object hashing
 * 3. **Sequence Optimization**: Optimizes block sequences for execution
 * 4. **Conditional Processing**: Handles if-else blocks and their nested sequences
 *
 * ## Compilation Process
 *
 * 1. **Block Hashing**: Each block is recursively hashed, including nested references
 * 2. **Sequence Building**: Block sequences are built with hashed IDs
 * 3. **If-Else Handling**: Conditional blocks are processed and integrated
 * 4. **Reference Resolution**: All $ref and $sequenceRef are resolved to final IDs
 *
 * ## Key Features
 *
 * - **Deterministic IDs**: Same block content always produces the same hash
 * - **Memory Efficiency**: Duplicate blocks are eliminated
 * - **Optimized Sequences**: Block sequences are optimized for execution order
 * - **Conditional Support**: Full support for if-else logic with nested sequences
 *
 * @param {Object} action - The source action object containing sequences, blocks, and blockSequences
 * @param {string[]} action.sequences - Array of block sequence reference IDs in execution order
 * @param {Object.<string, ActionCompileBlock>} action.blocks - Collection of block objects keyed by original block IDs
 * @param {Object.<string, string[]>} action.blockSequences - Collection of block sequences mapping sequence IDs to arrays of block IDs
 *
 * @returns {ActionCompileResult} Compiled action result containing:
 *   - `sequenceId`: Hashed ID representing the compiled sequence
 *   - `blocks`: Collection of compiled blocks keyed by hash
 *   - `blockSequences`: Collection of compiled block sequences
 *   - `sequences`: Array of sequence IDs in execution order
 *
 * @example
 * // Compile a simple action
 * const action = {
 *   sequences: ['seq1'],
 *   blocks: {
 *     'block1': { method: 'action_dispatch', blockValues: ['block2'] },
 *     'block2': { key: 'id', value: 'component-123' }
 *   },
 *   blockSequences: {
 *     'seq1': ['block1']
 *   }
 * }
 *
 * const compiled = compileAction(action)
 * // Result:
 * // {
 * //   sequenceId: 'hash_of_sequence',
 * //   blocks: {
 * //     'hash1': { method: 'action_dispatch', blockValues: ['hash2'] },
 * //     'hash2': { key: 'id', value: 'component-123' }
 * //   },
 * //   blockSequences: { 'hash_of_seq1': ['hash1'] },
 * //   sequences: ['hash_of_seq1']
 * // }
 *
 * @example
 * // Compile action with if-else
 * const action = {
 *   sequences: ['seq1', 'seq2'],
 *   blocks: {
 *     'block1': { ifElse: true, blockValues: ['block2', 'block3', 'block4'] },
 *     'block2': { key: 'if', blockValues: ['block5'] },
 *     'block3': { key: 'then', blockValues: ['block6'] },
 *     'block4': { key: 'else', blockValues: ['block7'] },
 *     'block5': { dataType: 'array', blockValues: ['block8'] },
 *     'block6': { value: 'seq1' },
 *     'block7': { value: 'seq2' },
 *     'block8': { dataType: 'object', blockValues: ['block9'] },
 *     'block9': { key: 'op', value: '==' }
 *   },
 *   blockSequences: {
 *     'seq1': ['block10'],
 *     'seq2': ['block11']
 *   }
 * }
 *
 * const compiled = compileAction(action)
 * // Result includes optimized if-else block with nested condition and sequences
 */
function compileAction (action) {
  const collection = Object.create(null)
  const blocks = Object.create(null)
  const blockSequences = Object.create(null)
  const sequences = []
  const ifElse = []

  for (let i = 0; i < action.sequences.length; i++) {
    const blockSequenceRefId = action.sequences[i]
    const sourceBlockSequence = action.blockSequences[blockSequenceRefId]
    const targetBlockSequence = []

    for (let j = 0; j < sourceBlockSequence.length; j++) {
      let blockId = sourceBlockSequence[j]
      const block = action.blocks[blockId]

      if (block.ifElse) {
        ifElse.push({
          ifElseBlockId: blockId,
          sequenceIndex: i,
          blockSequenceIndex: j,
          blockSequenceId: blockSequenceRefId,
          block: deepClone(block)
        })
      } else {
        const id = hashBlock(block, action.blocks, blocks, collection)

        collection[blockId] = id
        blockId = id
      }

      targetBlockSequence.push(blockId)
    }

    const blockSequenceId = objectHash(targetBlockSequence)

    collection[blockSequenceRefId] = blockSequenceId
    blockSequences[blockSequenceId] = targetBlockSequence
    sequences.push(blockSequenceId)
  }

  for (let i = ifElse.length - 1; i > -1; i--) {
    let { block, blockSequenceId, blockSequenceIndex, sequenceIndex, ifElseBlockId } = ifElse[i]

    for (let i = 0; i < block.blockValues.length; i++) {
      const id = block.blockValues[i]
      const parentBlock = deepClone(action.blocks[id])

      if (parentBlock.key === 'if') {
        for (let i = 0; i < parentBlock.blockValues.length; i++) {
          const blockId = parentBlock.blockValues[i]

          parentBlock.blockValues[i] = hashBlock(action.blocks[blockId], action.blocks, blocks, collection)
          collection[blockId] = block.blockValues[i]
        }

        // hash current object
        const parentBlockId = objectHash(parentBlock)

        blocks[parentBlockId] = parentBlock
        block.blockValues[i] = parentBlockId
        continue
      }

      for (let i = 0; i < parentBlock.blockValues.length; i++) {
        const block = deepClone(action.blocks[parentBlock.blockValues[i]])
        const sourceBlockSequence = action.blockSequences[block.value]
        const targetBlockSequence = []

        for (let i = 0; i < sourceBlockSequence.length; i++) {
          const blockId = sourceBlockSequence[i]

          targetBlockSequence[i] = collection[blockId]
        }

        const id = objectHash(targetBlockSequence)
        const sequenceIndex = sequences.indexOf(id)

        if (sequenceIndex > -1) {
          sequences.splice(sequenceIndex, 1)
        }

        blockSequences[id] = targetBlockSequence
        block.value = id
        block.blockSequence = id

        // hash current object
        const blockId = objectHash(block)

        blocks[blockId] = block
        parentBlock.blockValues[i] = blockId
      }

      // hash current object
      const parentBlockId = objectHash(parentBlock)

      blocks[parentBlockId] = parentBlock
      block.blockValues[i] = parentBlockId
    }

    // replace template with compiled if else block id
    const prevBlockSequenceId = collection[blockSequenceId]
    const blockId = objectHash(block)

    blockSequences[prevBlockSequenceId][blockSequenceIndex] = blockId
    blocks[blockId] = block
    // allow if statements to reference if statements
    collection[ifElseBlockId] = blockId
    // new id
    const newBlockSequenceId = objectHash(blockSequences[prevBlockSequenceId])
    blockSequences[newBlockSequenceId] = blockSequences[prevBlockSequenceId]
    delete blockSequences[prevBlockSequenceId]

    sequences[sequenceIndex] = newBlockSequenceId
  }

  return {
    sequenceId: objectHash(action.sequences),
    blocks,
    blockSequences,
    sequences
  }
}

export default compileAction

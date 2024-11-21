import { hash } from '@dooksa/utils'
import availableMethods from './available-methods.js'
import { parseAction } from '@dooksa/utils/server'

/**
 * @param {string} id
 * @param {import('./index.js').Action[]} data
 * @param {string[]} [dependencies]
 * @param {Object.<string, boolean>} [methods] - Allowed actions
 */
function createAction (id, data, dependencies = [], methods = availableMethods) {
  const sequences = []
  const blockSequences = {}
  const blockIndexes = {}
  let sequenceRefs = []
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
    // delete unused property
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

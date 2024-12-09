import { deepClone, objectHash } from '@dooksa/utils'

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

        sequences.splice(sequenceIndex, 1)
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

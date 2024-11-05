/**
 * Convert actions
 * @param {*} data
 * @param {*} methods
 * @param {Object} uuid
 * @param {string} uuid.prefix
 * @param {number} uuid.increment
 * @param {Object} [blocks={}]
 * @param {Object} [parentBlock]
 * @param {string[]} [blockSequences=[]]
 * @param {string} [dataType]
 * @param {Object[]} [$refs=[]]
 * @param {Object[]} [$sequenceRefs=[]]
 * @param {boolean} [isHead]
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
  const results = []
  let id

  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const item = data[key]
      const block = {}
      const result = { block }

      if (key === '$id' && isHead) {
        id = item
        delete item.$id
        continue
      }

      if (key === '$ref') {
        parentBlock.$ref = item

        delete parentBlock.dataType
        delete parentBlock.blockValues

        break
      }

      if (key === '$sequenceRef') {
        parentBlock.$sequenceRef = item

        delete parentBlock.dataType
        delete parentBlock.blockValues

        break
      }

      if (methods[key]) {
        result.isBlockSequence = true
        block.method = key
      } else if (key === 'action_ifElse') {
        result.isBlockSequence = true
        block.ifElse = true
      }

      if (!isHead && !result.isBlockSequence) {
        block.key = key
      }

      if (typeof item === 'object') {
        if (Array.isArray(item)) {
          block.dataType = 'array'
          block.blockValues = []
        } else {
          const keys = Object.keys(item)

          if (!methods[keys[0]]) {
            block.dataType = 'object'
            block.blockValues = []
          } else {
            block.blockValue = true
          }
        }

        dataType = block.dataType

        parseAction(item, methods, uuid, blocks, block, blockSequences, dataType, $sequenceRefs, $refs, false)
      } else if (item !== '$null') {
        block.value = item
      }

      results.push(result)
    }
  }

  for (let i = 0; i < results.length; i++) {
    const item = results[i]
    const blockId = uuid.prefix + '_' + ++uuid.increment

    if (item.block.hasOwnProperty('$ref')) {
      $refs.push([blockId, item.block.$ref])
    }

    if (item.block.hasOwnProperty('$sequenceRef')) {
      $sequenceRefs.push([blockId, item.block.$sequenceRef])
    }

    if (parentBlock) {
      if (parentBlock.blockValues) {
        parentBlock.blockValues.push(blockId)
      } else if (parentBlock.blockValue) {
        parentBlock.blockValue = blockId
      }
    }

    if (item.isBlockSequence) {
      blockSequences.push(blockId)
    }

    blocks[blockId] = item.block
  }

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

import { generateId } from '@dooksa/utils'

/**
 * Convert actions
 * @param {*} data
 * @param {*} methods
 * @param {Object} [blocks={}]
 * @param {string[]|string} [blockValues]
 * @param {string[]} [blockSequences=[]]
 * @param {string} [dataType]
 * @param {Object[]} [$refs=[]]
 * @param {boolean} [isHead]
 */
function parseAction (data, methods, blocks = {}, blockValues, blockSequences = [], dataType, $refs = [], isHead = true) {
  const results = []

  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const item = data[key]
      const block = {}
      const result = { block }

      if (key === '$ref') {
        result.$ref = item
      }

      if (methods[key]) {
        result.isMethod = true
        block.method = key
      }

      if (!isHead && !result.isMethod) {
        block.key = key
      }

      if (typeof item === 'object') {
        block.dataType = 'object'

        if (Array.isArray(item)) {
          block.dataType = 'array'
        }

        dataType = block.dataType
        block.blockValues = []

        parseAction(item, methods, blocks, block.blockValues, blockSequences, dataType, $refs, false)
      } else if (item !== '$null') {
        block.value = item
      }

      results.push(result)

    }
  }

  for (let i = 0; i < results.length; i++) {
    const item = results[i]
    const blockId = generateId()

    if (item.hasOwnProperty('$ref')) {
      $refs.push({ blockId, index: item.$ref })
    }

    if (blockValues) {
      if (dataType && Array.isArray(blockValues)) {
        blockValues.push(blockId)
      } else {
        blockValues = blockId
      }
    }

    if (item.isMethod) {
      blockSequences.push(blockId)
    }

    blocks[blockId] = item.block
  }

  if (isHead) {
    return {
      $refs,
      blocks,
      blockSequences
    }
  }
}

export default parseAction

import { generateId } from '@dooksa/utils'

function parseAction (data, methods, blocks = {}, blockValues, blockSequences = [], dataType, isHead = true) {
  const results = []

  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const item = data[key]
      const block = {}
      const result = { isMethod: false, block }
      let blockValue

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
        blockValue = []

        block.blockValues = blockValue

        parseAction(item, methods, blocks, blockValue, blockSequences, dataType, false)
      } else {
        block.value = item
      }

      results.push(result)

    }
  }

  for (let i = 0; i < results.length; i++) {
    const item = results[i]
    const blockId = generateId()

    if (blockValues) {
      if (dataType) {
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
      blocks,
      blockSequences
    }
  }
}

export default parseAction

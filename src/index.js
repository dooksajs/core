import { name, version } from '../ds.plugin.config'

export default {
  name,
  version,
  data: {
    operators: {
      '==': v => v[0] === v[1],
      '!=': v => v[0] !== v[1],
      '>': v => v[0] > v[1],
      '>=': v => v[0] >= v[1],
      '<': v => v[0] < v[1],
      '<=': v => v[0] <= v[1],
      '!': v => !v[0],
      '!!': v => !!v[0],
      '%': v => v[0] % v[1],
      '++x': v => ++v[0],
      'x++': v => v[0]++,
      '--x': v => --v[0],
      'x--': v => v[0]--,
      '-': v => v[0] - v[1],
      '+': v => v[0] + v[1],
      '*': v => v[0] * v[1],
      '**': v => v[0] ** v[1]
    }
  },
  methods: {
    /**
     * Evaluate two values
     * @param {Object} eval - The Object containing the data to evaluate two values
     * @param {string} eval.name - Operator name
     * @param {string[]|number[]} eval.values - Contains two values to be evaluated
     */
    eval ({ name, values }) {
      return this.operators[name](values)
    },
    /**
     * Compare two or more values
     * @param {string[]|number[]} values - Contains two values or more values which are compared
     */
    compare (values) {
      let result = false

      for (let i = 0; i < values.length; i++) {
        const value = values[i]

        if (value === '&&') {
          if ((values[i - 1] && values[i + 1])) {
            result = true
          } else {
            break
          }
        }

        if (value === '||') {
          if ((values[i - 1] || values[i + 1])) {
            result = true
          } else {
            break
          }
        }
      }

      return result
    },
    /**
     * Remove items from an array
     * @param {Object} arrayRemove - The Object containing the data to remove a group of items from an array
     * @param {*[]} arrayRemove.list - The source array
     * @param {number[]} arrayRemove.items - A list of indexes that will be removed
     */
    arrayRemove ({ list, items }) {
      return list.filter((item, index) => !items.includes(index))
    },
    /**
     * Move a group of items to a new position in an array
     * @param {Object} arrayMove - The Object containing the data to move a group of items within an array
     * @param {*[]} arrayMove.list - The source array
     * @param {number[]} arrayMove.items - A list of indexes that need to move
     * @param {number} arrayMove.index - The location the items will move to within the array
     */
    arrayMove ({ list, items, index }) {
      const length = items.length
      let indexEnd = index - (length - 1)

      if (indexEnd > list.length - 1 || (indexEnd < 0 && index < 0)) {
        return
      } else if (indexEnd <= 0 && index >= 0) {
        indexEnd = index
      }

      const listMiddle = []
      // Create middle of array with new group items
      for (let i = 0; i < length; i++) {
        listMiddle.push(list[items[i]])
      }

      items.sort((a, b) => a - b)
      const startList = list
      let offset = 1
      // Remove moved items
      for (let i = 0; i < length; i++) {
        startList.splice(items[i], 1)

        const nextIndex = i + 1
        if (nextIndex < length) {
          items[nextIndex] = items[nextIndex] - offset
          ++offset
        }
      }
      // Create end of array
      const listEnd = startList.splice(indexEnd)

      return startList.concat(listMiddle, listEnd)
    },
    /**
     * Merge items into array with the option to flatten
     * @param {Object} arrayMerge - The Object containing the data to merge items into an array
     * @param {array} arrayMerge.list - The source array
     * @param {Object[]} arrayMerge.items - An array of objects which contains the item and position it should be placed into the array
     * @param {*} arrayMerge.items[].value - The value to be merged into the original array
     * @param {number} arrayMerge.items[].index - The position the value will be placed into the original array
     * @param {number} arrayMerge.flat - The position the items will be placed in the array
     */
    arrayMerge ({ list, items, flat }) {
      let offset = 0
      items.sort((a, b) => a._$index - b._$index)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const index = item._$index + offset
        delete item._$index
        const listMiddle = [item]
        const listEnd = list.splice(index)
        list = list.concat(listMiddle, listEnd)
        ++offset
      }

      if (flat) {
        list = list.flat(flat)
      }

      return list
    }
  }
}

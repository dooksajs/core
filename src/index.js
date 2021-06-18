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
    eval ({ name, values }) {
      return this.operators[name](values)
    },
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
    arrayRemove ({ list, items }) {
      return list.filter((item, index) => !items.includes(index))
    },
    arrayMove ({ list, items, position }) {
      const length = items.length
      let indexEnd = position - length

      if (indexEnd > list.length - 1 || (indexEnd < 0 && position < 0)) {
        return
      }

      if (indexEnd <= 0 && position >= 0) {
        indexEnd = position
      }

      const listMiddle = []
      let offset = 0

      for (let i = 0; i < length; i++) {
        if (i > 0) {
          ++offset
        }

        let j = items[i] - offset

        if (j < 0) {
          j = items[i]
        }

        listMiddle.push(list[j])
        list.splice(j, 1)
      }

      const listEnd = list.splice(indexEnd)

      return list.concat(listMiddle, listEnd)
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

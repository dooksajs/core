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
    }
  }
}

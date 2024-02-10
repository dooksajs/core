import { existsSync, rename, readFile } from 'node:fs'
import { writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {import('@dooksa/ds-plugin/src/utils/DataResult.js')} DataResult

/**
 * @typedef {Object} Filter
 * @property {Array.<Array>} sequences - List of AND OR
 * @property {Array.<Array>} fields - List of field names and their position within the compare array to be replaced with the value from the result fields
 * @property {Array.<Array>} compare - List of conditionals
 */

/**
 * @namespace dsDatabase
 */
export default definePlugin({
  name: 'dsDatabase',
  version: 1,
  dependencies: [
    {
      name: 'dsOperator',
      version: 1
    }
  ],
  data: {
    path: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    storage: {
      default: () => '.ds_snapshots',
      private: true
    },
    snapshotLock: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    snapshotQueue: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    snapshotError: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    filterTypes: {
      private: true,
      default: () => ({
        f: [['f', 'a', 'l', 's', 'e'], false],
        t: [['t', 'r', 'u', 'e'], true],
        n: [['n', 'u', 'l', 'l'], null]
      }),
      schema: {
        type: 'object'
      }
    },
    operators: {
      private: true,
      default: () => ({
        '>': true,
        '>=': true,
        '<=': true,
        '<': true,
        '~': true,
        '!=': true,
        '==': true,
        ')': true,
        '(': true,
        '&': true,
        '|': true
      }),
      schema: {
        type: 'object'
      }
    }
  },
  setup ({ storage }) {
    if (storage) {
      this.storage = storage
    }

    const path = process.cwd()

    if (this.isDev) {
      this.storage = this.storage + '/development'
    } else {
      this.storage = this.storage + '/production'
    }

    this.path = resolve(path, this.storage)

    if (!existsSync(this.path)) {
      throw new Error('Storage path does not exist: ' + this.path)
    }
  },
  methods: {
    $getDatabaseValue (collections) {
      return (request, response) => {
        const result = []
        let filter

        if (request.query.filter) {
          filter = this._queryToFilter(request.query.filter)
        }

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

          // fetch collection
          if (!request.query.id) {
            const dataValues = this.$getDataValue(collection)

            if (filter) {
              if (dataValues.isCollection) {
                for (let i = 0; i < dataValues.item.length; i++) {
                  const data = dataValues.item[i]
                  const isValid = this._filterData(data, filter)

                  if (isValid) {
                    result.push(data)
                  }
                }
              } else {
                const isValid = this._filterData(dataValues, filter)

                if (isValid) {
                  result.push(dataValues)
                }
              }
            } else {
              result.push(dataValues)
            }

            continue
          }

          for (let i = 0; i < request.query.id.length; i++) {
            const id = request.query.id[i]
            const args = { id }
            const value = { id }

            if (request.query.expand) {
              args.options = {
                expand: true
              }

              value.expand = []
            }

            const data = this.$getDataValue(collection, args)

            if (data.isEmpty) {
              return response.status(404).send('Document not found:', collection, id)
            }

            value.item = data.item
            value.metadata = data.metadata
            value.collection = collection

            if (!data.isExpandEmpty) {
              value.expand = data.expand
            }

            if (filter) {
              const data = this._filterData(value, filter)

              if (data) {
                result.push(data)

                continue
              }
            }

            result.push(value)
          }
        }

        // if (request.query.sort) {
        //   const sortBy = request.query.sort.split(',')

        //   for (let i = 0; i < sortBy.length; i++) {
        //     const sort = sortBy[i]
        //   }
        // }

        response.status(200).send(result)
      }
    },
    $deleteDatabaseValue (collections) {
      return (request, response) => {
        let result = 0

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

          for (let i = 0; i < request.query.id.length; i++) {
            const id = request.query.id[i]
            const data = this.$deleteDataValue(collection, id, { cascade: request.query.cascade })

            if (!data.deleted) {
              return response.status(400).send('Could not delete document:', collection, id)
            }

            result += 1
          }

          if (this.snapshotError[collection]) {
            return response.status(500).send(this.snapshotError[collection])
          }

          this._setSnapshot(collections)
        }

        response.status(200).send('deleted: ' + result)
      }
    },
    $seedDatabase (name) {
      const path = resolve(this.path, name + '.json')

      if (!existsSync(path)) {
        return
      }

      readFile(path, 'utf8', (err, json) => {
        if (err) {
          console.error(err)
          return
        }
        const data = JSON.parse(json)
        const setData = this.$setDataValue(data.collection, data.item, {
          merge: true
        })

        if (!setData.isValid) {
          console.error(setData.error)
          return
        }

        // setup snapshot collection states
        this.snapshotQueue[data.collection] = false
        this.snapshotLock[data.collection] = false
        this.snapshotError[data.collection] = false

        console.log('Successfully loaded dsData collection:', data.collection)
      })
    },
    $setDatabaseValue ({ items, userId }) {
      const results = []
      const usedCollections = {}
      const collections = []

      for (let i = 0; i < items.length; i++) {
        const data = items[i]
        const metadata = data.metadata || { userId }

        if (metadata && !metadata.userId) {
          metadata.userId = userId
        }

        if (!metadata.userId) {
          return {
            isValid: false,
            error: {
              details: 'Author missing'
            }
          }
        }

        const setData = this.$setDataValue(data.collection, data.item, {
          id: data.id,
          metadata
        })

        if (!setData.isValid) {
          return setData
        }

        if (!usedCollections[data.collection]) {
          usedCollections[data.collection] = true
          collections.push(data.collection)
        }

        results.push(setData)
      }

      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i]

        if (this.snapshotError[collection]) {
          return {
            isValid: false,
            snapshotError: this.snapshotError[collection]
          }
        }

        this._setSnapshot(collection)
      }

      return {
        item: results,
        isValid: true,
        message: 'Successfully saved'
      }
    },
    /**
     *
     * @param {DataResult} data
     * @param {Filter} filter
     */
    _filterData (data, filter) {
      const notValid = false
      const compare = filter.compare.slice()
      const compareCloned = {}

      for (let i = 0; i < filter.fields.length; i++) {
        const [name, compareIndex, index] = filter.fields[i]

        if (name === 'createdAt' || name === 'updatedAt') {
          if (!compareCloned[compareIndex]) {
            compare[compareIndex] = compare[compareIndex].slice()
            compareCloned[compareIndex] = true
          }

          // update compare value with metadata
          compare[compareIndex][index] = data.metadata[name]
        } else {
          const properties = name.split('.')
          let value = data.item

          for (let i = 0; i < properties.length; i++) {
            const property = properties[i]

            if (value[property] == null) {
              value = undefined
              break
            }

            value = value[property]
          }

          if (value === undefined) {
            return notValid
          }

          if (!compareCloned[compareIndex]) {
            compare[compareIndex] = compare[compareIndex].slice()
            compareCloned[compareIndex] = true
          }

          // update compare value
          compare[compareIndex][index] = value
        }
      }

      const results = {}
      const sequences = filter.sequences
      let prevIndex

      /* eslint no-labels: ["error", { "allowLoop": true }] */
      sequence: for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i]

        if (!results[i]) {
          results[i] = {}
        }

        for (let j = 0; j < 3; j = j + 2) {
          let index = sequence[j]

          if (index === undefined) {
            break
          }

          // check if condition has already been processed
          if (Object.hasOwnProperty.call(results[i], j)) {
            continue
          }

          if (index < 0) {
            index = Math.abs(index) - 1
            const result = results[index]

            // check sequence
            if (result == null) {
              prevIndex = i - 1
              i = index - 1

              continue sequence
            }

            const left = result[0]
            const right = result[2]
            const andOr = sequences[index][1]

            if (andOr === '&&' && (!left || !right)) {
              return notValid
            }

            if (andOr === '||' && (!left && !right)) {
              return notValid
            }

            results[i][j] = true
          } else {
            results[i][j] = this.$method('dsOperator/eval', {
              name: compare[index][1],
              values: [compare[index][0], compare[index][2]]
            })
          }

          if (sequences.length === 1 && !results[i][j]) {
            return notValid
          }

          if (prevIndex != null && j === 2) {
            const result = results[i]

            if (sequence[1] === '&&' && (!result[0] || !result[2])) {
              return notValid
            } else if (!result[0] && !result[2]) {
              return notValid
            }
          }
        }

        if (prevIndex != null) {
          i = prevIndex
          prevIndex = null
        }

        return !notValid
      }
    },
    /**
     * Convert filter query
     * @param {string} query - Conditional query {@link https://eslint.style/rules/js/no-mixed-operators}
     * @returns {Filter}
     */
    _queryToFilter (query) {
      const result = {
        sequences: [],
        fields: [],
        compare: []
      }
      const brackets = []
      let sequenceIndex = -1
      let compare = []
      let value = ''

      for (let i = 0; i < query.length; i++) {
        let char = query[i]

        // ignore whitespace
        if (char === ' ') {
          continue
        }

        // open bracket
        if (char === '(') {
          result.sequences.push([])

          sequenceIndex++

          const bracketIndex = sequenceIndex + 1

          brackets.push(bracketIndex - bracketIndex * 2)

          continue
        }

        // close bracket
        if (char === ')') {
          if (compare.length) {
            const sequence = result.sequences[sequenceIndex]

            sequence.push(result.compare.length)
            result.compare.push(compare.slice())

            // reset compare
            compare = []

            if (sequence.length > 2) {
              result.sequences.push([])
              sequenceIndex++
            }
          }

          continue
        }

        // store string
        if (char === "'" || char === '"') {
          let j = i + 1
          let char = query[j]
          const length = query.length - 1

          do {
            value += char
            j++
            char = query[j]

            if (j > length) {
              throw new Error('String missing end quote')
            }
          } while (char !== "'" && char !== '"')

          i = j

          compare.push(value)
          value = ''

          if (compare.length > 2) {
            const sequence = result.sequences[sequenceIndex]

            sequence.push(result.compare.length)
            result.compare.push(compare.slice())

            compare = []

            if (sequence.length > 2) {
              result.sequences.push([])
              sequenceIndex++
            }
          }

          continue
        }

        // store and or
        if (char === '&' || char === '|') {
          char = query[++i]

          if (char !== '&' && char !== '|') {
            throw new Error('AND OR Unexpected character "' + char + '"')
          }

          const sequence = result.sequences[sequenceIndex]

          if (!sequence.length) {
            if (!brackets.length) {
              throw new Error('Expected brackets on left but was undefined')
            }

            sequence.push(brackets[brackets.length - 1])
            brackets.pop()
            sequence.push(char + char)
          } else {
            sequence.push(char + char)
          }

          for (let j = i + 1; j < query.length; j++) {
            const char = query[j]

            if (char === ' ') {
              continue
            }

            if (char !== '(') {
              i = j - 1

              break
            } else {
              const bracketIndex = sequenceIndex + 2

              sequence.push(bracketIndex - bracketIndex * 2)
              result.sequences.push([])

              i = j
              sequenceIndex++
              break
            }
          }

          continue
        }

        if (!value) {
          // store number
          if (!isNaN(parseInt(char))) {
            let j = i
            let num = query[j]

            while (!isNaN(parseInt(num))) {
              value += num
              num = query[++j]
            }

            i = j - 1

            const nextChar = query[j]

            if (!this.operators[nextChar]) {
              continue
            }

            compare.push(parseInt(value))

            value = ''

            if (compare.length > 2) {
              const sequence = result.sequences[sequenceIndex]

              sequence.push(result.compare.length)
              result.compare.push(compare.slice())

              compare = []

              if (sequence.length > 2) {
                result.sequences.push([])
                sequenceIndex++
              }
            }

            continue
          }

          const types = this.filterTypes[char]

          if (types) {
            const [chars, newValue] = types
            let isValid = true

            for (let j = 0; j < chars.length; j++) {
              const char = chars[j]

              if (char !== query[i + j]) {
                isValid = false
                break
              }
            }

            if (!isValid) {
              value += char

              continue
            }

            // test next char
            if (/[^a-zA-Z0-9_ ]/.test(query[i + chars.length])) {
              value += char

              continue
            }

            // set index after value
            i = i + chars.length
            // reset value
            value = ''

            compare.push(newValue)

            if (compare.length > 2) {
              const sequence = result.sequences[sequenceIndex]

              sequence.push(result.compare.length)
              result.compare.push(compare.slice())

              compare = []

              if (sequence.length > 2) {
                result.sequences.push([])
                sequenceIndex++
              }
            }

            continue
          }
        }

        const oneOp = this.operators[char]
        const twoOp = this.operators[char + query[i + 1]]

        if (!oneOp && !twoOp) {
          value += char
        } else {
          if (compare.length < 2) {
            result.fields.push([value, result.compare.length, compare.length])
            compare.push(value)
            value = ''
          }

          if (twoOp) {
            compare.push(char + query[++i])
          } else {
            compare.push(char)
          }

          if (compare.length > 2) {
            result.sequences[sequenceIndex].push(result.compare.length)
            result.compare.push(compare.slice())

            compare = []
            continue
          }

          if (result.sequences[sequenceIndex].length > 2) {
            result.sequences[sequenceIndex].push([])
            sequenceIndex++
          }
        }
      }

      // remove empty sequence
      if (!result.sequences[result.sequences.length - 1].length) {
        result.sequences.pop()
      }

      return result
    },
    _setSnapshot (collection) {
      // Exit early if error
      if (this.snapshotError[collection]) {
        return
      }

      // Set queue if locked
      if (this.snapshotLock[collection]) {
        this.snapshotQueue[collection] = true
        return
      }

      this.snapshotLock[collection] = true
      this.snapshotQueue[collection] = false

      const set = new Promise((resolve, reject) => {
        const data = this.$getDataValue(collection)

        if (data.isEmpty) {
          this.snapshotError[collection] = new Error('Snapshot failed, no collection found: ' + collection)

          console.error(this.snapshotError[collection])

          reject(this.snapshotError[collection])
        }

        const timestamp = Date.now()
        const uuid = this.$method('dsData/generateId')
        const fileName = collection.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()).replace('/', '-')
        const tempFilePath = join(this.path, fileName + uuid + '.json')
        const filePath = join(this.path, fileName + '.json')

        writeFile(tempFilePath, JSON.stringify({ collection, item: data.item, createdAt: timestamp }))
          .then(() => {
            rename(tempFilePath, filePath, (error) => {
              if (error) {
                reject(error)
                return
              }

              // unlock
              this.snapshotLock[collection] = false

              resolve()
            })
          })
          .catch(error => reject(error))
      })

      // save snapshot
      Promise.resolve(set)
        .then(() => {
          if (this.snapshotQueue[collection]) {
            this._setSnapshot(collection)
          }
        })
        .catch(error => {
          console.error(error)
          this.snapshotError[collection] = error
        })
    }
  }
})

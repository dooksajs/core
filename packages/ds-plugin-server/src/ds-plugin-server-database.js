import { existsSync, rename, readFile } from 'node:fs'
import { writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {import('@dooksa/ds-plugin/src/utils/DataResult.js')} DataResult
 * @typedef {import('@dooksa/ds-scripts/src/types.js').DsDataWhere} DsDataWhere
 */

/**
 * @namespace dsDatabase
 */
export default definePlugin({
  name: 'dsDatabase',
  version: 1,
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
    },
    types: {
      private: true,
      default: () => ({
        f: [['f', 'a', 'l', 's', 'e'], false],
        t: [['t', 'r', 'u', 'e'], true],
        n: [['n', 'u', 'l', 'l'], null]
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
        let result = []
        let where

        if (request.query.where) {
          where = this._stringToCondition(request.query.where)
        }

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

          // fetch collection
          if (!request.query.id) {
            const dataValues = this.$method('dsData/find', { name: collection, where })

            result = result.concat(dataValues)

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

            if (where) {
              const data = this._filterData(value, where)

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
    },
    /**
     * Convert conditional string to Where object
     * @private
     * @param {string} string - Conditional string
     * @returns {DsDataWhere}
     */
    _stringToCondition (string) {
      const result = {}
      const sequence = {
        index: 0,
        openBracket: false,
        closedBracket: false,
        list: [result],
        currentAndOr: '',
        current: result
      }
      let stringStart = 0
      let stringEnd = string.length
      let stringEndIndex = stringEnd - 1
      let condition = {}
      let value = ''

      if (string[0] === '(' && string[stringEndIndex] === ')') {
        stringStart++
        stringEnd--
        stringEndIndex--
      }

      // remove whitespace
      string = string.trim()

      for (let i = stringStart; i < stringEnd; i++) {
        let char = string[i]

        if (char === ' ') {
          continue
        }

        // store string
        if (char === "'" || char === '"') {
          let j = i + 1
          let char = string[j]

          do {
            value += char
            j++
            char = string[j]

            if (j > string.length) {
              throw new Error('String missing end quote')
            }
          } while (char !== "'" && char !== '"')

          i = j

          condition.value = value

          // end of condition
          if (i === stringEndIndex) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push(condition)
            } else {
              sequence.current.name = condition.name
              sequence.current.op = condition.op
              sequence.current.value = condition.value
            }

            break
          }

          value = ''

          continue
        }

        const types = this.types[char]

        // store by (boolean/null)
        if (types) {
          const [chars, newValue] = types
          let isValid = true

          for (let j = 0; j < chars.length; j++) {
            const char = chars[j]

            if (char !== string[i + j]) {
              isValid = false
              break
            }
          }

          if (!isValid) {
            value += char

            continue
          }

          // test next char
          if (/[^a-zA-Z0-9_ ]/.test(string[i + chars.length])) {
            value += char

            continue
          }

          condition.value = newValue

          // end of condition
          if (i === stringEndIndex) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push(condition)
            } else {
              sequence.current.name = condition.name
              sequence.current.op = condition.op
              sequence.current.value = condition.value
            }

            break
          }

          // set index after value
          i = i + chars.length
          // reset value
          value = ''

          continue
        }

        // store number
        if (!isNaN(parseInt(char))) {
          let j = i
          let num = string[j]

          while (!isNaN(parseInt(num))) {
            value += num
            num = string[++j]
          }

          i = j - 1

          const nextChar = string[j]

          if (!this.operators[nextChar] && nextChar !== ' ' && i !== stringEnd) {
            continue
          }

          condition.value = parseInt(value)

          // end of condition
          if (i === stringEndIndex) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push(condition)
            } else {
              sequence.current.name = condition.name
              sequence.current.op = condition.op
              sequence.current.value = condition.value
            }

            break
          }

          value = ''

          continue
        }

        if (char === '(') {
          sequence.openBracket = true

          continue
        }

        if (char === ')') {
          --sequence.index
          sequence.closedBracket = true

          continue
        }

        if (char === '&' || char === '|') {
          char = string[++i]

          if (char !== '&' && char !== '|') {
            throw new Error('AND OR Unexpected character "' + char + '"')
          }

          let andOr = 'and'

          if (char === '|') {
            andOr = 'or'
          }

          if (sequence.closedBracket && condition.value !== '' && condition.op !== '' && condition.name !== '') {
            sequence.closedBracket = false
            sequence.current.push(condition)
            condition = {
              name: '',
              op: '',
              value: ''
            }
          }

          const currentIndex = sequence.list.indexOf(sequence.current)
          let listChange = false

          if (currentIndex !== sequence.index) {
            sequence.current = sequence.list[sequence.index]
            listChange = true
          }

          if (sequence.openBracket || listChange || !sequence.currentAndOr) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push({
                [andOr]: []
              })
              sequence.current = sequence.current[sequence.current.length - 1][andOr]
            } else {
              if (!sequence.current[andOr]) {
                sequence.current[andOr] = []
              }

              sequence.current = sequence.current[andOr]
            }

            sequence.openBracket = false
            sequence.index = sequence.list.length
            sequence.list.push(sequence.current)
            sequence.currentAndOr = andOr
          } else if (sequence.currentAndOr !== andOr) {
            throw new Error("Unexpected mix of '&&' and '||'. Use parentheses to clarify the intended order of operations.")
          }

          if (value !== '') {
            condition.value = value
            value = ''
          }

          if (condition.value !== '' && condition.op !== '' && condition.name !== '') {
            sequence.current.push(condition)
            condition = {
              name: '',
              op: '',
              value: ''
            }
          }

          continue
        }

        const op1 = this.operators[char]
        const op2 = this.operators[char + string[i + 1]]
        if (op1 || op2) {
          if (op1) {
            condition.op = char
          } else if (op2) {
            condition.op = char + string[++i]
          }

          if (value === '') {
            throw new Error('Missing value before operator')
          }

          condition.name = value

          value = ''

          continue
        }

        value += char

        // end of condition
        if (i === stringEndIndex) {
          if (Array.isArray(sequence.current)) {
            sequence.current.push(condition)
          } else {
            sequence.current.name = condition.name
            sequence.current.op = condition.op
            sequence.current.value = value
          }
        }
      }

      return result
    }
  }
})

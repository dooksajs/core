import { createPlugin } from '@dooksa/create-plugin'
import { existsSync, rename, readFile } from 'node:fs'
import { writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import { dataGetValue, dataSetValue, dataDeleteValue, dataFind } from '../client/index.js'
import { generateId } from '@dooksa/utils'
import { log } from '@dooksa/utils/server'

/**
 * @typedef {import('../../../types.js').DataWhere} DataWhere
 */

const snapshotLock = {}
const snapshotQueue = {}
const snapshotError = {}
let snapshotPath = ''

const operators = {
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
}
const types = {
  f: [['f', 'a', 'l', 's', 'e'], false],
  t: [['t', 'r', 'u', 'e'], true],
  n: [['n', 'u', 'l', 'l'], null]
}

function setSnapshot (collection) {
  // Exit early if error
  if (snapshotError[collection]) {
    return
  }

  // Set queue if locked
  if (snapshotLock[collection]) {
    snapshotQueue[collection] = true
    return
  }

  snapshotLock[collection] = true
  snapshotQueue[collection] = false

  const set = new Promise((resolve, reject) => {
    const data = dataGetValue(collection)

    if (data.isEmpty) {
      snapshotError[collection] = new Error('Snapshot failed, no collection found: ' + collection)

      console.error(snapshotError[collection])

      reject(snapshotError[collection])
    }

    const timestamp = Date.now()
    const uuid = generateId
    const fileName = collection.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()).replace('/', '-')
    const tempFilePath = join(snapshotPath, fileName + uuid + '.json')
    const filePath = join(snapshotPath, fileName + '.json')

    writeFile(tempFilePath, JSON.stringify({
      collection,
      item: data.item,
      createdAt: timestamp
    }))
      .then(() => {
        rename(tempFilePath, filePath, (error) => {
          if (error) {
            reject(error)
            return
          }

          // unlock
          snapshotLock[collection] = false

          resolve()
        })
      })
      .catch(error => reject(error))
  })

  // save snapshot
  Promise.resolve(set)
    .then(() => {
      if (snapshotQueue[collection]) {
        setSnapshot(collection)
      }
    })
    .catch(error => {
      console.error(error)
      snapshotError[collection] = error
    })
}

/**
 * Convert conditional string to Where object
 * @private
 * @param {string} string - Conditional string
 * @returns {DataWhere}
 */
function stringToCondition (string) {
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

    // store by (boolean/null)
    if (types[char]) {
      const [chars, newValue] = types[char]
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

      if (!operators[nextChar] && nextChar !== ' ' && i !== stringEnd) {
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

    const op1 = operators[char]
    const op2 = operators[char + string[i + 1]]
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

export const database = createPlugin('database', {
  methods: {
    getValue (collections) {
      return (request, response) => {
        let result = []
        let where

        if (request.query.where) {
          where = stringToCondition(request.query.where)
        }

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]
          // fetch collection
          if (!request.query.id) {
            const args = {
              name: collection,
              where
            }

            if (request.query.expand) {
              args.options = {
                expand: true
              }
            }

            const dataValues = dataFind(args)

            result = result.concat(dataValues)

            continue
          }

          for (let i = 0; i < request.query.id.length; i++) {
            const id = request.query.id[i]
            const args = {
              name: collection,
              id
            }
            const value = { id }

            if (request.query.expand) {
              args.options = {
                expand: true
              }

              value.expand = []
            }

            const data = dataGetValue(args)

            if (data.isEmpty) {
              return response.status(404).send(`Document not found: ${collection} ${id}`)
            }

            value.item = data.item
            value.metadata = data.metadata
            value.collection = collection

            if (!data.isExpandEmpty) {
              value.expand = data.expand
            }

            if (where) {
              const data = dataFind({
                name: collection,
                where
              })

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

        response.status(200).json(result)
      }
    },
    deleteValue (collections) {
      return (request, response) => {
        let result = 0

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

          for (let i = 0; i < request.query.id.length; i++) {
            const id = request.query.id[i]
            const data = dataDeleteValue({
              name: collection,
              id,
              cascade: request.query.cascade
            })

            if (!data.deleted) {
              return response.status(400).send(`Could not delete document: ${collection} ${id}`)
            }

            result += 1
          }

          if (snapshotError[collection]) {
            return response.status(500).json(snapshotError[collection])
          }

          setSnapshot(collections)
        }

        response.status(200).send('deleted: ' + result)
      }
    },
    /**
     *
     * @param {string} name -
     */
    seed (name) {
      const path = resolve(snapshotPath, name + '.json')

      if (!existsSync(path)) {
        return
      }

      readFile(path, 'utf8', (err, json) => {
        if (err) {
          console.error(err)
          return
        }

        const data = JSON.parse(json)

        // set cache
        dataSetValue({
          name: data.collection,
          value: data.item,
          options: {
            merge: true
          }
        })

        // setup snapshot collection states
        snapshotQueue[data.collection] = false
        snapshotLock[data.collection] = false
        snapshotError[data.collection] = false

        log({
          message: 'Loaded seed data',
          context: data.collection
        })
      })
    },
    /**
     *
     * @param {Object} param
     * @param {Array} param.items
     * @param {string} [param.userId]
     */
    setValue ({ items, userId }) {
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

        const setData = dataSetValue({
          name: data.collection,
          value: data.item,
          options: {
            id: data.id,
            metadata
          }
        })

        if (!usedCollections[data.collection]) {
          usedCollections[data.collection] = true
          collections.push(data.collection)
        }

        results.push(setData)
      }

      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i]

        if (snapshotError[collection]) {
          return {
            isValid: false,
            snapshotError: snapshotError[collection]
          }
        }

        setSnapshot(collection)
      }

      return {
        item: results,
        isValid: true,
        message: 'Successfully saved'
      }
    }
  },
  setup ({ storage = '.ds_snapshots' } = {}) {
    snapshotPath = resolve(process.cwd(), storage)

    if (!existsSync(snapshotPath)) {
      throw new Error('Storage path does not exist: ' + snapshotPath)
    }
  }
})

export const {
  databaseSeed,
  databaseDeleteValue,
  databaseGetValue,
  databaseSetValue
} = database

export default database


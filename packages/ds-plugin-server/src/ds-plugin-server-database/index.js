import { existsSync, rename, readFile } from 'node:fs'
import { writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import definePlugin from '../definePlugin.js'

/**
 * @namespace dsDatabase
 */
export default /* @__PURE__ */ definePlugin({
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
      default: () => 'ds_data',
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
    }
  },
  setup ({ storage }) {
    if (storage) {
      this.storage = storage
    }

    const path = process.cwd()

    this.path = resolve(path, this.storage)

    if (!existsSync(this.path)) {
      throw new Error('Storage path does not exist: ' + this.path)
    }
  },
  methods: {
    $getDatabaseValue (collections) {
      return (request, response) => {
        const result = []

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

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

            result.push(value)
          }
        }

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
        console.log('Seed file missing:', path)
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
    }
  }
})

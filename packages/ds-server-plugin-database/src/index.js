import { existsSync, rename, readFile } from 'fs'
import { writeFile } from 'fs/promises'
import { resolve, join } from 'path'

/**
 * @namespace dsDatabase
 */
export default {
  name: 'dsDatabase',
  version: 1,
  data: {
    path: {
      private: true,
      default: ''
    },
    storage: {
      default: 'ds_data',
      private: true
    }
  },
  setup (storage) {
    // if (storage) {
    //   this.storage = storage
    // }
    const path = process.cwd()

    this.path = resolve(path, this.storage)

    if (!existsSync(this.path)) {
      throw new Error('Storage path does not exist:', this.path)
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
        const updateDB = []
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

          updateDB.push(this.$setDatabaseCollection(collection))
        }

        Promise.all(updateDB)
          .then(() => {
            response.status(200).send('deleted: ' + result)
          })
          .catch(error => {
            console.error(error)
            response.status(500).send(error)
          })
      }
    },
    $setDatabaseCollection (collection) {
      return new Promise((resolve, reject) => {
        const data = this.$getDataValue(collection)

        if (data.isEmpty) {
          reject(new Error('No collection found:', collection))
        }

        const timestamp = Date.now()
        const uuid = this.$method('dsData/generateId')
        const fileName = collection.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()).replace('/', '-')
        const tempFilePath = join(this.path, fileName + '_' + uuid + '.json')
        const filePath = join(this.path, fileName + '.json')

        writeFile(tempFilePath, JSON.stringify({ collection, item: data.item, createdAt: timestamp }))
          .then(() => {
            rename(tempFilePath, filePath, (error) => {
              if (error) {
                reject(error)
                return
              }

              resolve()
            })
          })
          .catch(error => reject(error))
      })
    },
    $setDatabaseSeed (name) {
      const path = resolve(this.path, name + '.json')

      if (!existsSync(path)) {
        console.log('Seed file not exist:', path)
      }

      readFile(path, 'utf8', (err, json) => {
        if (err) {
          console.error(err)
          return
        }
        const data = JSON.parse(json)
        const setData = this.$setDataValue(data.collection, {
          source: data.item,
          options: {
            source: {
              merge: true
            }
          }
        })

        if (!setData.isValid) {
          console.error(setData.error)
          return
        }

        console.log('Successfully loaded dsData collection:', data.collection)
      })
    },
    _create (request, response) {
      const items = request.body
      const usedCollections = {}

      for (let i = 0; i < items.length; i++) {
        const data = items[i]
        const setData = this.$setDataValue(data.collection, {
          source: data.item,
          options: {
            id: data.id,
            userId: request.user.id
          }
        })

        if (!setData.isValid) {
          return response.status(400).send(setData.error.details)
        }

        usedCollections[data.collection] = true
      }

      const collections = Object.keys(usedCollections)
      const files = []

      for (let i = 0; i < collections.length; i++) {
        const file = this.$setDatabaseCollection(collections[i])

        files.push(file)
      }

      Promise.all(files)
        .then(() => {
          response.status(201).send('Successfully saved')
        })
        .catch(error => response.status(500).send(error))
    }
  }
}

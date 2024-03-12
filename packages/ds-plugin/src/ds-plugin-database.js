import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {import('@dooksa/ds-scripts/src/types.js').DsDataWhere} DsDataWhere
 */

/**
 * @namespace dsDatabase
 */
export default definePlugin({
  name: 'dsDatabase',
  version: 1,
  data: {
    hostname: {
      private: true,
      default: () => 'http://localhost:6362/_/',
      schema: {
        type: 'string'
      }
    },
    requestQueue: {
      private: true,
      schema: {
        type: 'collection'
      }
    },
    requestCacheExpire: {
      private: true,
      default: () => 300000,
      schema: {
        type: 'number'
      }
    },
    requestCache: {
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            expireIn: {
              type: 'number'
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  collection: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  setup ({ hostname } = {}) {
    if (hostname) {
      this.hostname = hostname + '/_/'
    }
  },
  methods: {
    create ({ collection, id, data, options = {} }) {
      return new Promise((resolve, reject) => {
        this.getOne({ collection, id, options })
          .then(response => {
            this.update({
              collection,
              id: response.id,
              data,
              options
            })
              .then((result) => resolve(result))
              .catch((error) => reject(error))
          })
          .catch(response => {
            if (response.code === 404) {
              // create new entry
              this.$action(this.createName, {
                collection,
                data,
                options
              },
              {
                onSuccess: (result) => resolve(result),
                onError: (error) => reject(error)
              })
            }
          })
      })
    },
    delete ({ collection, id }) {
      return new Promise((resolve, reject) => {
        this.$action(this.deleteName, {
          collection,
          id
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        })
      })
    },
    /**
     * Get a list of documents
     * @param {Object} param
     * @param {string} param.collection - Name of the records' collection.
     * @param {number} [param.expand] - Fetch related documents.
     * @param {number} [param.page] - The page (aka. offset) of the paginated list (default to 1).
     * @param {number} [param.perPage] - The max returned records per page (default to 25).
     * @param {number} [param.limit] - The max returned records per page (default to 25).
     * @param {DsDataWhere} [param.where] -
     * @param {boolean} [param.sync] - Sync data with local database
     */
    getAll ({ collection, page, perPage, limit, where, expand, sync = true }) {
      if (!collection) {
        return this.$log('error', {
          message: 'Collection was not defined'
        })
      }

      const and = '&'
      let query = '?'
      let firstQuery = true

      if (page) {
        if (firstQuery) {
          firstQuery = false
          query += and
        }

        query += 'page=' + page
      }

      if (perPage) {
        if (firstQuery) {
          firstQuery = false
          query += and
        }

        query += 'perPage=' + perPage
      }

      if (limit) {
        if (firstQuery) {
          firstQuery = false
          query += and
        }

        query += 'limit=' + limit
      }

      if (where) {
        if (firstQuery) {
          firstQuery = false
          query += and
        }

        query += 'where=' + where
      }

      if (expand) {
        if (firstQuery) {
          firstQuery = false
          query += and
        }

        query += expand
      }

      // reset query
      if (query === '?') {
        query = ''
      }

      const path = collection + query
      const cacheData = this._getCache(path)

      if (cacheData) {
        return cacheData
      }

      return new Promise((resolve, reject) => {
        fetch(this.hostname + path)
          .then(response => {
            if (response.ok) {
              return response.json()
            }

            resolve(false)
          })
          .then(data => {
            if (sync) {
              this._sync(data, path)
            }

            resolve(data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getById ({ collection, id, expand, sync = true }) {
      if (!collection) {
        return this.$log('error', {
          message: 'Collection was not defined'
        })
      }

      if (!Array.isArray(id)) {
        id = [id]
      }

      let query = '?id=' + id[0]

      for (let i = 1; i < id.length; i++) {
        const value = id[i]

        query += '&id=' + value
      }

      if (expand) {
        query += '&expand=true'
      }

      const path = collection + query
      const cacheData = this._getCache(path)

      if (cacheData) {
        return cacheData
      }

      const request = new Promise((resolve, reject) => {
        fetch(this.hostname + path)
          .then(response => {
            if (response.ok) {
              return response.json()
            }

            resolve({
              isEmpty: true
            })
          })
          .then(data => {
            if (sync) {
              this._sync(data, path)
            }

            resolve(data)
          })
          .catch(error => {
            reject(error)
          })
      })

      // add to queue
      this.requestQueue[path] = request

      return request
    },
    update ({ collection, id, data }) {
      return new Promise((resolve, reject) => {
        this.$action(this.updateName, {
          collection,
          id,
          data
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        })
      })
    },
    _getCache (id) {
      const cache = this.$getDataValue('dsDatabase/requestCache', { id })

      if (cache.isEmpty) {
        return this.requestQueue[id]
      }

      if (cache.item.expireIn && cache.item.expireIn < Date.now()) {
        this.$deleteDataValue('dsDatabase/requestCache', id)

        return
      }

      const result = []

      for (let i = 0; i < cache.item.data.length; i++) {
        const item = cache.item.data[i]
        const data = this.$getDataValue(item.collection, { id: item.id })

        result.push(data)
      }

      return result
    },
    _sync (data, id) {
      const requestCache = []

      for (let i = 0; i < data.length; i++) {
        const dataItem = data[i]

        this.$setDataValue(dataItem.collection, dataItem.item, {
          id: dataItem.id,
          metadata: dataItem.metadata
        })

        if (dataItem.expand) {
          for (let i = 0; i < dataItem.expand.length; i++) {
            const data = dataItem.expand[i]

            this.$setDataValue(data.collection, data.item, {
              id: data.id,
              metadata: data.metadata
            })

            requestCache.push({
              id: data.id,
              collection: data.collection
            })
          }
        }

        requestCache.push({
          id: dataItem.id,
          collection: dataItem.collection
        })

        this.$addDataListener(dataItem.collection, {
          on: 'delete',
          id: dataItem.id,
          handler: {
            id,
            value: this._deleteCache
          }
        })
      }

      this.$setDataValue('dsDatabase/requestCache', {
        expireIn: Date.now() + this.requestCacheExpire,
        data: requestCache
      }, { id })
    },
    _deleteCache (id) {
      this.$deleteDataValue('dsDatabase/requestCache', id)
    }
  }
})

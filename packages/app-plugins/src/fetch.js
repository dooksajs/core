import createPlugin from '@dooksa/create-plugin'
import { $getDataValue, $setDataValue, $addDataListener } from './data.js'

/** @typedef {import('../../types.js').DataValue} DataValue */

const fetchRequestQueue = {}
const fetchRequestCache = {}
let fetchRequestCacheExpire = 300000
let _hostname = ''

function getCache (id) {
  const cache = fetchRequestCache[id]

  if (!cache) {
    return fetchRequestQueue[id]
  }

  if (cache.expireIn && cache.expireIn < Date.now()) {
    return deleteCache(id)
  }

  const result = []

  for (let i = 0; i < cache.data.length; i++) {
    const item = cache.data[i]
    const data = $getDataValue(item.collection, { id: item.id })

    result.push(data)
  }

  return result
}

function setRequestData (data, id) {
  const requestCache = []

  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]

    $setDataValue(dataItem.collection, dataItem.item, {
      id: dataItem.id,
      metadata: dataItem.metadata
    })

    if (dataItem.expand) {
      for (let i = 0; i < dataItem.expand.length; i++) {
        const data = dataItem.expand[i]

        $setDataValue(data.collection, data.item, {
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

    $addDataListener(dataItem.collection, {
      on: 'delete',
      id: dataItem.id,
      handler: deleteCache
    })
  }

  fetchRequestCache[id] = {
    expireIn: Date.now() + fetchRequestCacheExpire,
    data: requestCache
  }
}

function deleteCache (id) {
  delete fetchRequestCache[id]
}

const $fetch = createPlugin({
  name: 'fetch',
  setup ({ hostname = '' } = {}) {
    _hostname = hostname + '/_/'
  },
  actions: {
    /**
     * Get a list of documents
     * @param {Object} param
     * @param {string} param.collection - Name of the records' collection.
     * @param {boolean} [param.expand] - Fetch related documents.
     * @param {number} [param.page] - The page (aka. offset) of the paginated list (default to 1).
     * @param {number} [param.perPage] - The max returned records per page (default to 25).
     * @param {number} [param.limit] - The max returned records per page (default to 25).
     * @param {string} [param.where] -
     * @param {boolean} [param.sync] - Sync data with local database
     * @returns {DataValue}
     */
    getAll ({ collection, page, perPage, limit, where, expand, sync = true }) {
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
      const cacheData = getCache(path)

      if (cacheData) {
        return cacheData
      }

      return new Promise((resolve, reject) => {
        fetch(_hostname + path)
          .then(response => {
            if (response.ok) {
              return response.json()
            }

            resolve(false)
          })
          .then(data => {
            if (sync) {
              setRequestData(data, path)
            }

            resolve(data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * Get value by id
     * @param {Object} param
     * @param {string} param.collection - Name of the records' collection.
     * @param {string[]|string} param.id - Document id
     * @param {boolean} [param.expand] - Fetch related documents.
     * @param {boolean} [param.sync] - Sync data with local database
     * @returns {DataValue}
     */
    getById ({ collection, id, expand, sync = true }) {
      if (!Array.isArray(id)) {
        id = [id]
      }

      let query = '?id=' + id[0]

      // append multiple id's to query
      for (let i = 1; i < id.length; i++) {
        const value = id[i]

        query += '&id=' + value
      }

      if (expand) {
        query += '&expand=true'
      }

      const path = collection + query
      const cacheData = getCache(path)

      if (cacheData) {
        return cacheData
      }

      const request = new Promise((resolve, reject) => {
        fetch(_hostname + path)
          .then(response => {
            if (response.ok) {
              return response.json()
            }
          })
          .then(data => {
            if (data) {
              if (sync) {
                setRequestData(data, path)
              }

              resolve(data)
            } else {
              resolve({
                isEmpty: true
              })
            }
          })
          .catch(error => {
            reject(error)
          })
      })

      // add to queue
      fetchRequestQueue[path] = request

      return request
    }
  }
})

const $fetchAll = $fetch.actions.getAll
const $fetchById = $fetch.actions.getById

export {
  $fetchAll,
  $fetchById
}

export default $fetch

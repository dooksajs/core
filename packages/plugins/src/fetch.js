import createPlugin from '@dooksa/create-plugin'
import { dataGetValue, dataSetValue, dataAddListener } from './data.js'

const fetchRequestQueue = {}
const fetchRequestCache = {}
let fetchRequestCacheExpire = 300000
let _hostname = '/_/'

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
    const data = dataGetValue({
      name: item.collection,
      id: item.id,
      options: {
        expand: item.expand
      }
    })

    result.push(data)
  }

  return result
}

function setRequestData (data, id) {
  const requestCache = []

  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]

    dataSetValue({
      name: dataItem.collection,
      value: dataItem.item,
      options: {
        id: dataItem.id,
        metadata: dataItem.metadata
      }
    })

    if (dataItem.expand) {
      for (let i = 0; i < dataItem.expand.length; i++) {
        const data = dataItem.expand[i]

        dataSetValue({
          name: data.collection,
          value: data.item,
          options: {
            id: data.id,
            metadata: data.metadata
          }
        })
      }
    }

    requestCache.push({
      id: dataItem.id,
      collection: dataItem.collection,
      expand: !!dataItem.expand
    })

    dataAddListener({
      name: dataItem.collection,
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

const $fetch = createPlugin('fetch', {
  metadata: {
    title: 'Fetch',
    description: 'Fetch data from the backend',
    icon: 'mdi:file-document-box-search'
  },
  actions: {
    getAll: {
      metadata: {
        title: 'Get documents',
        description: 'Get a list of documents',
        icon: 'mdi:files'
      },
      parameters: {
        type: 'object',
        properties: {
          collection: {
            title: 'Collection',
            type: 'string',
            component: 'action-param-collection'
          },
          expand: {
            title: 'Fetch related documents',
            type: 'boolean',
            component: 'action-param-boolean'
          },
          page: {
            title: 'Page offset',
            type: 'number',
            component: 'action-param-number'
          },
          perPage: {
            title: 'Amount of documents per page request (default to 25)',
            type: 'number',
            component: 'action-param-number'
          },
          limit: {
            title: 'The max returned documents',
            type: 'number',
            component: 'action-param-number'
          },
          where: {
            title: 'Where',
            type: 'string',
            component: 'action-param-string'
          }
        }
      },
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
       */
      method ({ collection, page, perPage, limit, where, expand, sync = true }) {
        const and = '&'
        let query = '?'
        let firstQueryOption = true

        if (page) {
          if (firstQueryOption) {
            firstQueryOption = false
          } else {
            query += and
          }

          query += 'page=' + page
        }

        if (perPage) {
          if (firstQueryOption) {
            firstQueryOption = false
          } else {
            query += and
          }

          query += 'perPage=' + perPage
        }

        if (limit) {
          if (firstQueryOption) {
            firstQueryOption = false
          } else {
            query += and
          }

          query += 'limit=' + limit
        }

        if (where) {
          if (firstQueryOption) {
            firstQueryOption = false
          } else {
            query += and
          }

          query += 'where=' + where
        }

        if (expand) {
          if (firstQueryOption) {
            firstQueryOption = false
          } else {
            query += and
          }

          query += 'expand=true'
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
      }
    },
    getById: {
      metadata: {
        title: 'Get document by ID',
        description: 'Fetch a single document by ID',
        icon: 'mdi:file'
      },
      parameters: {
        type: 'object',
        properties: {
          collection: {
            title: 'Collection',
            type: 'string',
            component: 'action-param-collection',
            required: true
          },
          id: {
            title: 'Document',
            type: 'string',
            component: 'action-param-value',
            required: true
          },
          expand: {
            title: 'Fetch related documents',
            type: 'boolean',
            component: 'action-param-boolean'
          }
        }
      },
      /**
       * Get value by id
       * @param {Object} param
       * @param {string} param.collection - Name of the records' collection.
       * @param {string[]|string} param.id - Document id
       * @param {boolean} [param.expand] - Fetch related documents.
       * @param {boolean} [param.sync] - Sync data with local database
       */
      method ({ collection, id, expand, sync = true }) {
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
  },
  /**
   * @param {Object} param
   * @param {string} [param.hostname='']
   */
  setup ({ hostname = '' } = {}) {
    _hostname = hostname + _hostname
  }
})

const fetchAll = $fetch.actions.getAll
const fetchById = $fetch.actions.getById

export {
  $fetch,
  fetchAll,
  fetchById
}

export default $fetch

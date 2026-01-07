import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, stateSetValue, stateAddListener } from '#client'

const fetchRequestQueue = {}
const fetchRequestCache = {}
let fetchRequestCacheExpire = 300000
let _hostname = '/_/'

/**
 * Retrieve cached data for a given request ID
 * @param {string} id - The cache key/path for the request
 * @returns {Promise|Array|undefined} - Returns cached promise, data array, or undefined if not cached
 */
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
    const data = stateGetValue({
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

/**
 * Store fetched data in state and set up cache
 * @param {Array} data - Array of data items to store
 * @param {string} id - Cache key/path for the request
 */
function setRequestData (data, id) {
  const requestCache = []

  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i]

    stateSetValue({
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

        stateSetValue({
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

    stateAddListener({
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

/**
 * Delete cached data for a given request ID
 * @param {string} id - The cache key/path to delete
 */
function deleteCache (id) {
  delete fetchRequestCache[id]
}

export const $fetch = createPlugin('fetch', {
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
            type: 'string',
            component: {
              title: 'Collection',
              id: 'action-param-collection'
            }
          },
          expand: {
            type: 'boolean',
            component: {
              title: 'Fetch related documents',
              id: 'action-param-boolean'
            }
          },
          page: {
            type: 'number',
            component: {
              title: 'Page offset',
              id: 'action-param-number'
            }
          },
          perPage: {
            type: 'number',
            component: {
              title: 'Amount of documents per page request (default to 25)',
              id: 'action-param-number'
            }
          },
          limit: {
            type: 'number',
            component: {
              title: 'The max returned documents',
              id: 'action-param-number'
            }
          },
          where: {
            type: 'string',
            component: {
              title: 'Where',
              id: 'action-param-string'
            }
          }
        }
      },
      /**
       * Get a list of documents from a collection with optional filtering and pagination
       * @param {Object} param - Parameters for fetching documents
       * @param {string} param.collection - Name of the records' collection
       * @param {boolean} [param.expand=false] - Whether to fetch related documents
       * @param {number} [param.page=1] - The page number (offset) for paginated results
       * @param {number} [param.perPage=25] - Maximum number of records returned per page
       * @param {number} [param.limit] - Maximum total number of records to return (overrides perPage)
       * @param {string} [param.where] - Filter condition for the query
       * @param {boolean} [param.sync=true] - Whether to sync fetched data with local database state
       * @returns {Promise<Array|boolean>} - Promise resolving to array of documents or false on error
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
            type: 'string',
            component: {
              title: 'Collection',
              id: 'action-param-collection'
            },
            required: true
          },
          id: {
            type: 'string',
            component: {
              title: 'Document',
              id: 'action-param-value'
            },
            required: true
          },
          expand: {
            type: 'boolean',
            component: {
              title: 'Fetch related documents',
              id: 'action-param-boolean'
            }
          }
        }
      },
      /**
       * Get one or more documents by their ID(s) from a collection
       * @param {Object} param - Parameters for fetching documents by ID
       * @param {string} param.collection - Name of the records' collection
       * @param {string[]|string} param.id - Single document ID or array of IDs
       * @param {boolean} [param.expand=false] - Whether to fetch related documents
       * @param {boolean} [param.sync=true] - Whether to sync fetched data with local database state
       * @returns {Promise<Object>} - Promise resolving to fetched document(s) or empty object if not found
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
   * Setup the fetch plugin configuration
   * @param {Object} param - Setup parameters
   * @param {string} [param.hostname=''] - Base hostname/URL for API requests (will be prepended to '/_/')
   */
  setup ({ hostname = '' } = {}) {
    _hostname = hostname + _hostname
  }
})

export const {
  fetchGetAll,
  fetchGetById
} = $fetch

export default $fetch

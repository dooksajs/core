import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, stateSetValue, stateAddListener } from '#client'

/**
 * @import {DataValue} from '../utils/data-value.js'
 */


export const $fetch = createPlugin('fetch', {
  metadata: {
    title: 'Fetch',
    description: 'Fetch data from the backend',
    icon: 'mdi:file-document-box-search'
  },
  data: {
    hostname: '/_/',
    requestCacheExpire: 300000,
    requestCache: {},
    requestQueue: {}
  },
  privateMethods: {
    /**
     * Retrieve cached data for a given request ID
     * @param {string} path - The cache key/path for the request
     * @returns {DataValue[]|undefined} - Returns cached promise or undefined if not cached
     */
    getCacheByPath (path) {
      // Check cache
      const cache = this.requestCache[path]
      if (!cache) {
        return
      }

      // Handle expired cache
      if (cache.expireIn && cache.expireIn < Date.now()) {
        this.deleteCache(path)
        return
      }

      // Return cached data
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
    },
    /**
     * Retrieve cached data a given request ID
     * @param {string} path - The cache key/path for the request
     * @returns {Promise<DataValue[]>|undefined} - Returns cached promise or undefined if not cached
     */
    getRequestByPath (path) {
      return this.requestQueue[path]
    },
    /**
     * Remove a request from the request queue
     * @param {string} path - The cache key/path to remove from queue
     */
    deleteRequestQueueByPath (path) {
      delete this.requestQueue[path]
    },
    /**
     * Delete cached data for a given request ID
     * @param {string} path - The cache key/path to delete
     */
    deleteCacheByPath (path) {
      delete this.requestCache[path]
    },
    /**
     * Store fetched data in state and set up cache
     * @param {Array} data - Array of data items to store
     * @param {string} path - Cache key/path for the request
     */
    setRequestDataByPath (data, path) {
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
          handler: this.deleteCache
        })
      }

      this.requestCache[path] = {
        expireIn: Date.now() + this.requestCacheExpire,
        data: requestCache
      }
    }
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
       * @returns {Promise<DataValue[]>} - Promise resolving to array of documents or false on error
       */
      method ({
        collection,
        page,
        perPage,
        limit,
        where,
        expand,
        sync = true
      }) {
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

          query += 'where=' + encodeURIComponent(where)
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
        const cacheData = this.getCacheByPath(path)

        if (cacheData) {
          return Promise.resolve(cacheData)
        }

        let request = this.getRequestByPath(path)

        if (request) {
          return request
        }

        const deleteRequestQueueByPath = this.deleteRequestQueueByPath
        const setRequestDataByPath = this.setRequestDataByPath

        request = new Promise((resolve, reject) => {
          fetch(this.hostname + path)
            .then(response => {
              if (response.ok) {
                return response.json()
              }
              throw new Error(`HTTP error! status: ${response.status}`)
            })
            .then(data => {
              // remove from queue
              deleteRequestQueueByPath(path)

              if (sync) {
                setRequestDataByPath(data, path)
              }

              resolve(data)
            })
            .catch(error => {
              // remove from queue on error
              deleteRequestQueueByPath(path)
              reject(error)
            })
        })

        this.requestQueue[path] = request

        return request
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
       * @returns {Promise<DataValue[]>} - Promise resolving to fetched document(s) or array
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
        const cacheData = this.getCacheByPath(path)

        if (cacheData) {
          return Promise.resolve(cacheData)
        }

        let request = this.getRequestByPath(path)

        if (request) {
          return request
        }

        request = new Promise((resolve, reject) => {
          fetch(this.hostname + path)
            .then(response => {
              if (response.ok) {
                return response.json()
              }
              throw new Error(`HTTP error! status: ${response.status}`)
            })
            .then(data => {
              // Remove from queue once complete
              this.deleteRequestQueueByPath(path)

              if (data && data.length > 0) {
                if (sync) {
                  this.setRequestDataByPath(data, path)
                }

                resolve(data)
              } else {
                // Return empty array for empty responses
                reject(new Error('Fetch: no item found "' + path + '"'))
              }
            })
            .catch(error => {
              // Remove from queue on error
              this.deleteRequestQueueByPath(path)
              reject(error)
            })
        })

        // add to queue immediately
        this.requestQueue[path] = request

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
    this.hostname = hostname + this.hostname
  }
})

export const {
  fetchGetAll,
  fetchGetById
} = $fetch

export default $fetch



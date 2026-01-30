import { createPlugin } from '@dooksa/create-plugin'
import { stateSetValue, stateAddListener } from '#core'

/**
 * @import {DataValue} from '../../../types.js'
 */

/**
 * @template T
 * @typedef {Object} ApiDataValue - Complete data value with metadata and context
 * @property {string} collection - Collection name
 * @property {T} item - The data value
 * @property {boolean} isEmpty - Flag for empty results
 */

export const api = createPlugin('api', {
  metadata: {
    title: 'API',
    description: 'Fetch data from the backend',
    icon: 'mdi:file-document-box-search'
  },
  data: {
    urlPrefix: '',
    hostname: '',
    baseUrl: '',
    requestCacheExpire: 300000,
    requestCache: {},
    requestQueue: {}
  },
  privateMethods: {
    /**
     * Retrieve cached data for a given request ID
     * @param {string} path - The cache key/path for the request
     * @returns {ApiDataValue<DataValue<*>[]>|undefined} - Returns cached api result or undefined if not cached
     */
    getCacheByPath (path) {
      // Check cache
      const cache = this.requestCache[path]

      if (typeof cache !== 'object') {
        return
      }

      // Handle expired cache
      if (cache.expireIn && cache.expireIn < Date.now()) {
        this.deleteCacheByPath(path)
        return
      }

      // Return the cached
      return cache.cachedResult
    },
    /**
     * Retrieve cached data a given request ID
     * @param {string} path - The cache key/path for the request
     * @returns {Promise<ApiDataValue<DataValue<*>[]>>|undefined} - Returns cached promise or undefined if not cached
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
     * @param {string} collection - Name of the records' collection
     * @param {Array} data - Array of data items to store
     * @param {string} path - Cache key/path for the request
     */
    setRequestDataByPath (collection, data, path) {
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

        const deleteCacheByPath = this.deleteCacheByPath

        stateAddListener({
          name: dataItem.collection,
          on: 'delete',
          id: dataItem.id,
          handler: () => {
            deleteCacheByPath(path)
          }
        })
      }

      this.requestCache[path] = {
        expireIn: Date.now() + this.requestCacheExpire,
        data: requestCache,
        cachedResult: {
          collection,
          item: data,
          isEmpty: data.length === 0
        }
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
       * @returns {Promise<ApiDataValue<DataValue<*>[]>>} - Promise resolving to array of documents or false on error
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
        const self = this
        request = new Promise((resolve, reject) => {
          fetch(this.baseUrl + path)
            .then(response => {
              if (response.ok) {
                return response.json()
              }
              throw new Error(`HTTP error! status: ${response.status}`)
            })
            .then(data => {
              // remove from queue
              self.deleteRequestQueueByPath(path)

              if (sync) {
                self.setRequestDataByPath(collection, data, path)
              }

              resolve({
                collection: collection,
                item: data,
                isEmpty: data.length === 0
              })
            })
            .catch(error => {
              // remove from queue on error
              self.deleteRequestQueueByPath(path)
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
       * @returns {Promise<ApiDataValue<DataValue<*>[]>>} - Promise resolving to fetched document(s) or array
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
          fetch(this.baseUrl + path)
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
                  this.setRequestDataByPath(collection, data, path)
                }

                resolve({
                  collection: collection,
                  item: data,
                  isEmpty: false
                })
              } else {
                // Return empty result instead of rejecting
                resolve({
                  collection: collection,
                  item: [],
                  isEmpty: true
                })
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
   * Setup the api plugin configuration
   * @param {Object} param - Setup parameters
   * @param {string} [param.hostname='http://localhost:6362'] - Hostname
   * @param {string} [param.urlPrefix='/_/'] - Url prefix, defaults to '/_/'
   */
  setup ({ hostname = 'http://localhost:6362', urlPrefix = '/_/' } = {}) {
    if (hostname) {
      this.hostname = hostname
    }

    if (urlPrefix) {
      this.urlPrefix = urlPrefix
    }

    // set url
    this.baseUrl = this.hostname + this.urlPrefix
  }
})

export const {
  apiGetAll,
  apiGetById
} = api

export default api

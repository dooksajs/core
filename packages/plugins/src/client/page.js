import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, stateSetValue } from '#core'
import { routeCurrentId } from '#client'
import { hash } from '@dooksa/utils'
import { createDataValue } from '#utils'

/**
 * @import {PageGetItemsByPath} from '../../../types.js'
 */

export const page = createPlugin('page', {
  metadata: {
    title: 'Page',
    description: 'Manage dooksa pages',
    icon: 'bi:layout-text-window'
  },
  state: {
    schema: {
      id: {
        type: 'collection',
        defaultId () {
          return routeCurrentId
        },
        suffixId () {
          return stateGetValue({ name: 'metadata/currentLanguage' }).item
        },
        items: {
          type: 'string'
        }
      },
      events: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      redirects: {
        type: 'collection',
        items: {
          type: 'object',
          required: ['temporary', 'name', 'pathId'],
          properties: {
            name: {
              type: 'string'
            },
            pathId: {
              type: 'string',
              relation: 'page/paths'
            },
            isTemporary: {
              type: 'boolean'
            }
          }
        }
      },
      paths: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            itemId: {
              type: 'string',
              relation: 'page/items'
            }
          }
        }
      },
      items: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'component/items'
          }
        }
      }
    }
  },
  methods: {
    /**
     * Retrieves data from state and appends it to the provided data array.
     * This method handles both direct data and expanded relationships.
     *
     * @param {Object} param - The parameters object
     * @param {string} param.collection - The state collection name to retrieve data from
     * @param {string} param.id - The ID of the item to retrieve
     * @param {Array} param.data - The array to append retrieved data to
     * @param {Object} [param.expandExclude] - Optional object containing IDs to exclude from expansion
     * @param {boolean} [param.expand=true] - Whether to expand relationships
     */
    appendExpand ({ collection, id, data, expandExclude, expand = true }) {
      const getData = stateGetValue({
        name: collection,
        id,
        options: {
          expand,
          expandExclude
        }
      })

      if (getData.isEmpty) {
        return
      }

      data.push({
        collection,
        id: getData.id,
        item: getData.item,
        metadata: getData.metadata
      })

      if (getData.isExpandEmpty) {
        return
      }

      for (let i = 0; i < getData.expand.length; i++) {
        data.push(getData.expand[i])
      }
    },
    /**
     * Converts a path string to a unique ID by hashing it.
     *
     * @param {string} path - Path name without query parameters
     * @returns {string} The generated path ID
     */
    pathToId (path) {
      return '_' + hash.update(path) + '_'
    },
    /**
     * Retrieves all page items by ID, including expanded component relationships.
     * This method recursively expands component children to build a complete page structure.
     *
     * @param {string} id - The page ID to retrieve
     * @returns {Object} The page data object containing isEmpty and item properties
     */
    getItemsById (id) {
      const page = stateGetValue({
        name: 'page/items',
        id,
        options: {
          expand: true
        }
      })

      if (page.isEmpty) {
        return {
          isEmpty: true
        }
      }

      const pageDataValue = createDataValue({
        collection: 'page/items',
        id,
        value: page.item
      })

      pageDataValue.metadata = page.metadata

      const data = [pageDataValue]
      const expandExclude = page.expandIncluded

      for (let i = 0; i < page.expand.length; i++) {
        const item = page.expand[i]

        data.push(item)

        if (item.collection === 'component/items') {
          this.appendExpand({
            collection: 'component/children',
            id: item.id,
            data,
            expandExclude
          })

          for (let i = 0; i < data.length; i++) {
            const child = data[i]

            if (child.collection === 'component/items') {
              if (child.id !== item.id) {
                this.appendExpand({
                  collection: 'component/children',
                  id: child.id,
                  data,
                  expandExclude
                })
              }
            }
          }
        }
      }

      return {
        isEmpty: false,
        item: data
      }
    }
  },
  actions: {
    save: {
      metadata: {
        title: 'Save page',
        description: 'Save page data to the server',
        icon: 'mdi:content-save'
      },
      /**
       * Saves page data to the server via HTTP POST request.
       * This method retrieves the complete page structure and sends it to the server.
       *
       * @param {Object} param - The parameters object
       * @param {string} param.id - The page ID to save
       * @returns {Promise} Promise that resolves when the save operation completes
       */
      method (id) {
        const pageData = this.getItemsById(id)

        if (pageData.isEmpty) {
          return
        }

        fetch('http://localhost:3000/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pageData.item)
        })
          .then((response) => {
            console.log(response)
            if (response.status !== 201) {
              return
            }

            return response.json()
          })
          .then(data => {
            console.log(data)
          })
          .catch(e => console.log(e))
      }
    },
    getItemsByPath: {
      metadata: {
        title: 'Get page by path',
        description: 'Retrieve page items by path with redirect support',
        icon: 'mdi:file-find'
      },
      /**
       * Retrieves page items by path, with support for redirects.
       * This method handles both direct path lookups and temporary/permanent redirects.
       *
       * @param {string} path - The path to look up
       * @returns {PageGetItemsByPath} The page data or redirect information
       */
      method (path) {
        const currentPathId = this.pathToId(path)

        // get related items to path
        const pathInfo = stateGetValue({
          name: 'page/paths',
          id: currentPathId
        })

        if (pathInfo.isEmpty) {
          const redirect = stateGetValue({
            name: 'page/redirects',
            id: currentPathId
          })

          if (!redirect.isEmpty) {
            const { pathId, isTemporary } = redirect.item
            const page = stateGetValue({
              name: 'page/paths',
              id: pathId
            })

            const result = this.getItemsById(pathId)

            return Object.assign({
              isTemporary,
              redirect: page.item.name
            }, result)
          }

          return {
            isEmpty: true
          }
        }

        const pageItems = this.getItemsById(pathInfo.item.itemId)

        if (pageItems.isEmpty) {
          return pageItems
        }

        pageItems.item.push(pathInfo)

        return pageItems
      }
    }
  },
  /**
   * Setup function that initializes the page on the client.
   * Fetches the current page based on the route and loads all components.
   * @TODO Implement 404 page handling
   */
  setup () {
    // fetch current page
    const pagePath = stateGetValue({
      name: 'page/paths',
      id: routeCurrentId()
    })

    /** @TODO 404 page */
    if (pagePath.isEmpty) {
      return
    }

    const pageItems = stateGetValue({
      name: 'page/items',
      id: pagePath.item.itemId,
      options: {
        expand: true
      }
    })

    const components = []

    for (let i = 0; i < pageItems.expand.length; i++) {
      const component = stateSetValue({
        name: 'component/items',
        value: pageItems.expand[i].item
      })
      components.push(component.id)
    }

    // append components to page
    stateSetValue({
      name: 'component/children',
      value: components,
      options: {
        id: 'root'
      }
    })
  }
})

export const {
  pageAppendExpand,
  pageSave,
  pagePathToId,
  pageGetItemsById,
  pageGetItemsByPath
} = page

export default page

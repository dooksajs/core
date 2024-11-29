import createPlugin from '@dooksa/create-plugin'
import { dataGetValue, routeCurrentId, dataSetValue } from './index.js'
import { hash } from '@dooksa/utils'
import { createDataValue } from '#utils'

/**
 * @import {DataValue} from '#types'
 * @typedef {Object} PageGetItemsByPath
 * @property {boolean} isEmpty
 * @property {string} [redirect]
 * @property {boolean} [isTemporary]
 * @property {string} [pageId]
 * @property {DataValue[]} [item]
 */

export const page = createPlugin('page', {
  metadata: {
    title: 'Page',
    description: 'Manage dooksa pages',
    icon: 'bi:layout-text-window'
  },
  models: {
    id: {
      type: 'collection',
      defaultId () {
        return routeCurrentId
      },
      suffixId () {
        return dataGetValue({ name: 'metadata/currentLanguage' }).item
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
  },
  methods: {
    /**
     * Get data and append
     * @param {Object} param
     * @param {string} param.collection,
     * @param {string} param.id,
     * @param {*} param.data
     * @param {Object} [param.expandExclude]
     * @param {boolean} [param.expand=true]
     */
    appendExpand ({ collection, id, data, expandExclude, expand = true }) {
      const getData = dataGetValue({
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
     * @param {string} path - Path name without query parameters
     */
    pathToId (path) {
      return '_' + hash.update(path) + '_'
    },
    /**
     * @param {string} id - Page id
     * @returns {PageGetItemsByPath}
     */
    getItemsById (id) {
      const page = dataGetValue({
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
        data: page.item
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
        description: '',
        icon: ''
      },
      /**
       *
       * @param {Object} param
       * @param {string} param.id -
       * @returns
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
        description: ''
      },
      /**
       * @param {string} path
       * @returns {PageGetItemsByPath}
       */
      method (path) {
        const currentPathId = this.pathToId(path)

        // get related items to path
        const pathInfo = dataGetValue({
          name: 'page/paths',
          id: currentPathId
        })

        if (pathInfo.isEmpty) {
          const redirect = dataGetValue({
            name: 'page/redirects',
            id: currentPathId
          })

          if (!redirect.isEmpty) {
            const { pageId, isTemporary } = redirect.item
            const page = dataGetValue({
              name: 'page/paths',
              id: pageId
            })

            const result = this.getItemsById(pageId)

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
  setup () {
    // fetch current page
    const pagePath = dataGetValue({
      name: 'page/paths',
      id: routeCurrentId()
    })

    /** @TODO 404 page */
    if (pagePath.isEmpty) {
      return
    }

    const pageItems = dataGetValue({
      name: 'page/items',
      id: pagePath.item.itemId,
      options: {
        expand: true
      }
    })

    const components = []

    for (let i = 0; i < pageItems.expand.length; i++) {
      const component = dataSetValue({
        name: 'component/items',
        value: pageItems.expand[i].item
      })
      components.push(component.id)
    }

    // append components to page
    dataSetValue({
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

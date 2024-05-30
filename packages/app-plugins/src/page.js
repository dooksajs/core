import createPlugin from '@dooksa/create-plugin'
import { $getDataValue, routeCurrentId, componentAppendChildren } from './index.js'

const page = createPlugin({
  name: 'page',
  models: {
    id: {
      type: 'collection',
      defaultId () {
        return routeCurrentId
      },
      suffixId () {
        return $getDataValue('metadata/currentLanguage').item
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
  actions: {
    /**
     *
     * @param {Object} param
     * @param {string} param.id -
     * @returns
     */
    save (id) {
      const pageData = this.getById(id)

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
    },
    getById (id) {
      const pageData = $getDataValue('page/items', { id, options: { expand: true } })

      if (pageData.isEmpty) {
        return {
          isEmpty: true
        }
      }

      const data = [{
        collection: 'page/items',
        id,
        item: pageData.item,
        metadata: pageData.metadata
      }]

      const expandExclude = pageData.expandIncluded

      for (let i = 0; i < pageData.expand.length; i++) {
        const item = pageData.expand[i]

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

              this.appendExpand({
                collection: 'component/content',
                id: child.id,
                data,
                expandExclude
              })
            }
          }
        }
      }

      return {
        isEmpty: false,
        item: data
      }
    },
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
      const getData = $getDataValue(collection, { id, options: { expand, expandExclude } })

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
    }
  },
  setup () {
    const component = $getDataValue('page/items', { id: routeCurrentId() })

    if (component.isEmpty) {
      return
    }

    // attach current page components
    for (let i = 0; i < component.item.length; i++) {
      componentAppendChildren({ nodeId: 'root', id: component.item[i] })
    }
  }
})

const pageAppendExpand = page.actions.appendExpand
const pageGetById = page.actions.getById
const pageSave = page.actions.save

export {
  pageAppendExpand,
  pageGetById,
  pageSave
}

export default page

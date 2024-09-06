import createPlugin from '@dooksa/create-plugin'
import { dataGetValue, routeCurrentId, dataSetValue } from './index.js'

const page = createPlugin('page', {
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
    save: {
      /**
       *
       * @param {Object} param
       * @param {string} param.id -
       * @returns
       */
      method (id) {
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
      }
    },
    getById: {
      method (id) {
        const pageData = dataGetValue({
          name: 'page/items',
          id,
          options: {
            expand: true
          }
        })

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
      }
    },
    appendExpand: {
      /**
       * Get data and append
       * @param {Object} param
       * @param {string} param.collection,
       * @param {string} param.id,
       * @param {*} param.data
       * @param {Object} [param.expandExclude]
       * @param {boolean} [param.expand=true]
       */
      method ({ collection, id, data, expandExclude, expand = true }) {
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
      }
    }
  },
  setup () {
    const component = dataGetValue({ name: 'page/items', id: routeCurrentId() })

    if (component.isEmpty) {
      return
    }

    dataSetValue({
      name: 'component/children',
      value: component.item,
      options: {
        id: 'root'
      }
    })
  }
})

const pageAppendExpand = page.actions.appendExpand
const pageGetById = page.actions.getById
const pageSave = page.actions.save

export {
  page,
  pageAppendExpand,
  pageGetById,
  pageSave
}

export default page

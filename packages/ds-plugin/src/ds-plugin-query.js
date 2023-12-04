import { definePlugin } from '@dooksa/utils'

/**
 * @namespace dsQuery
 */
export default definePlugin({
  name: 'dsQuery',
  version: 1,
  data: {
    items: {
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              contentId: {
                type: 'string',
                relation: 'dsContent/items'
              },
              widgetId: {
                type: 'string',
                relation: 'dsWidget/items'
              },
              sectionId: {
                type: 'string',
                relation: 'dsSection/items'
              }
            }
          }
        }
      }
    }
  },
  methods: {
    sort ({ id, options = {} }) {
      const queryData = this.$getDataValue('dsQuery/items', { id })

      if (queryData.isEmpty) {
        return
      }

      const methodName = '_sort/by/' + options.type

      if (typeof this[methodName] === 'function') {
        const items = this._fetchValues(queryData.item)

        return this[methodName](items)
      } else {
        this.$log('error', { message: 'Sort method does not exist: ' + methodName })
      }
    },
    _ascendingValues (a, b) {
      // ignore upper and lowercase
      const A = typeof a.value === 'string' ? a.value.toUpperCase() : a.value
      const B = typeof b.value === 'string' ? b.value.toUpperCase() : b.value

      if (A < B) {
        return -1
      }

      if (A > B) {
        return 1
      }

      // names must be equal
      return 0
    },
    _descendingValues (a, b) {
      // ignore upper and lowercase
      const A = typeof a.value === 'string' ? a.value.toUpperCase() : a.value
      const B = typeof b.value === 'string' ? b.value.toUpperCase() : b.value

      if (A > B) {
        return -1
      }

      if (A < B) {
        return 1
      }

      // names must be equal
      return 0
    },
    _fetchValues (items) {
      return items.map(item => {
        const content = this.$getDataValue('dsContent/items', { id: item.contentId })
        let contentValue = content.item

        if (item.contentPosition) {
          for (let i = 0; i < item.contentPosition.length; i++) {
            const key = item.contentPosition[i]

            contentValue = contentValue[key]
          }
        }

        return {
          value: contentValue,
          widgetId: item.widgetId
        }
      })
    },
    '_sort/by/ascending' (item) {
      return item.sort(this._ascendingValues)
    },
    '_sort/by/descending' (item) {
      return item.sort(this._descendingValues)
    }
  }
})

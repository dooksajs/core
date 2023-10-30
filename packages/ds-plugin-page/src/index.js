/**
 * DsPage plugin.
 * @namespace dsPage
 */
export default {
  name: 'dsPage',
  version: 1,
  data: {
    id: {
      default: {},
      schema: {
        type: 'collection',
        defaultId () {
          return this.$method('dsRouter/currentPath')
        },
        suffixId () {
          return this.$getDataValue('dsMetadata/language').item
        },
        items: {
          type: 'string'
        }
      }
    },
    events: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    items: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsSection/items'
          }
        }
      }
    }
  },
  /** @lends dsPage */
  methods: {
    save ({ id }) {
      const pageData = this.$getDataValue('dsPage/items', { id, options: { expand: true } })

      if (pageData.isEmpty) {
        return
      }

      const data = []
      const expandExclude = pageData.expandIncluded

      for (let i = 0; i < pageData.expand.length; i++) {
        const item = pageData.expand[i]

        data.push(item)

        if (item.collection === 'dsSection/items') {
          this._appendExpand('dsSection/templates', item.id, data, expandExclude)
        } else if (item.collection === 'dsWidget/items') {
          this._appendExpand('dsWidget/content', item.id, data, expandExclude)
          this._appendExpand('dsWidget/events', item.id, data, expandExclude)
          this._appendExpand('dsWidget/layouts', item.id, data, expandExclude)
          this._appendExpand('dsWidget/sections', item.id, data, expandExclude)
          this._appendExpand('dsWidget/templates', item.id, data, expandExclude, false)
        }
      }

      fetch('http://localhost:3000/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then((response) => {
          console.log(response)
        })
        .catch(e => console.log(e))
    },
    _appendExpand (collection, id, data, expandExclude, expand = true) {
      const getData = this.$getDataValue(collection, { id, options: { expand, expandExclude } })

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
    _render (id) {

    }
  }
}

import { definePlugin } from '@dooksa/utils'

/**
 * @typedef {Object} QueryItem
 * @property {string} contentId - dsContent/item id
 * @property {string} widgetId - dsWidget/item id
 * @property {string[]} content - The content value position within the content object
 */

/**
 * @typedef {Object} QueryWhere
 * @property {string} name - Name of operator
 * @property {*} value - Value to compare with content value
 */

/**
 * @typedef {string} QuerySort
 */

/**
 * @typedef {Object} QueryValue
 * @property {(string|number)} value - Content value
 * @property {string} widgetId - dsWidget/item id
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
              content: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  methods: {
    /**
     * Append query to section
     * @param {Object} param
     * @param {string} param.id - Query Id
     * @param {Object} param.options
     * @param {QueryWhere} param.options.where
     * @param {QuerySort} param.options.sort
     * @param {string} param.dsSectionId - Section to overwrite with query
     */
    addToSection ({ id, options, dsSectionId }) {
      this.$setDataValue('dsSection/query', { id, options }, {
        id: dsSectionId
      })

      const mode = this.$getDataValue('dsSection/mode', { id: dsSectionId })
      let sectionId = dsSectionId

      if (!mode.isEmpty) {
        sectionId = sectionId + mode.item
      }

      this.$addDataListener('dsSection/items', {
        on: 'update',
        id: sectionId,
        priority: 1,
        handler: {
          id,
          value: (result) => {
            const queryData = this.$getDataValue('dsQuery/items', { id })

            if (queryData.isEmpty) {
              console.error('query should not be empty')
            }

            if (result.isEmpty) {
              return this.$setDataValue('dsQuery/items', [], { id })
            }

            const query = []
            const currentSection = {}

            // collect current widgets
            for (let i = 0; i < result.item.length; i++) {
              currentSection[result.item[i]] = true
            }

            // update query widget list
            for (let i = 0; i < queryData.item.length; i++) {
              const item = queryData.item[i]

              if (currentSection[item.widgetId]) {
                query.push(item)

                currentSection[item.widgetId] = false
              }
            }

            this.$setDataValue('dsQuery/items', query, {
              id: queryData.id
            })
          }
        }
      })
    },
    /**
     * Fetch values by query
     * @param {Object} param
     * @param {string} param.id - Query Id
     * @param {Object} param.options
     * @param {QueryWhere} param.options.where - Where options
     * @param {QuerySort} param.options.sort - Sort type
     * @returns {QueryValue[]}
     */
    fetch ({ id, options }) {
      const queryData = this.$getDataValue('dsQuery/items', { id })

      if (queryData.isEmpty) {
        return
      }

      let items = this._fetchValues(queryData.item)

      if (options.where) {
        items = this._where(items, options.where)
      }

      if (options.sort) {
        items = this._sort(items, options.sort)
      }

      return items
    },
    /**
     * Fetch content values
     * @private
     * @param {QueryItem[]} items
     * @returns {QueryValue[]}
     */
    _fetchValues (items) {
      return items.map(item => {
        const content = this.$getDataValue('dsContent/items', { id: item.contentId })
        let contentValue = content.item.values

        for (let i = 0; i < item.content.length; i++) {
          const property = item.content[i]

          if (content.item.tokens[property]) {
            // process token value
          }

          contentValue = contentValue[property]
        }

        return {
          value: contentValue,
          widgetId: item.widgetId
        }
      })
    },
    /**
     * Sort list
     * @private
     * @param {QueryValue[]} items
     * @param {QuerySort} type - Sort by
     * @returns {QueryValue[]}
     */
    _sort (items, type) {
      const methodName = '_sort/by/' + type

      if (typeof this[methodName] === 'function') {
        return this[methodName](items)
      } else {
        this.$log('error', { message: 'Sort method does not exist: ' + methodName })
      }
    },
    /**
     * Sort by ascending callback
     * @private
     * @param {QueryValue} a
     * @param {QueryValue} b
     * @returns {number}
     */
    _sortAscending (a, b) {
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
    /**
     * Sort by descending callback
     * @private
     * @param {QueryValue} a
     * @param {QueryValue} b
     * @returns {number}
     */
    _sortDescending (a, b) {
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
    /**
     * Sort by ascending
     * @private
     * @param {QueryValue[]} item
     * @returns {QueryValue[]}
     */
    '_sort/by/ascending' (item) {
      return item.sort(this._sortAscending)
    },
    /**
     * Sort by descending
     * @private
     * @param {QueryValue[]} item
     * @returns {QueryValue[]}
     */
    '_sort/by/descending' (item) {
      return item.sort(this._sortAscending)
    },
    /**
     * Filter items based on conditions
     * @private
     * @param {*[]} items
     * @param {QueryWhere[]} options
     * @returns {*[]}
     */
    _where (items, options) {
      return items.filter(value => {
        let valid = false

        for (let i = 0; i < options.length; i++) {
          const option = options[i]

          valid = this.$method('dsOperator/eval', {
            name: option.name,
            values: [value, option.value]
          })
        }

        return valid
      })
    }
  }
})

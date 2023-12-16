import { definePlugin } from '@dooksa/ds-scripts'

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
    },
    where: {
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            options: {
              type: 'array'
            },
            id: {
              type: 'string',
              relation: 'dsQuery/items'
            }
          }
        }
      }
    },
    sort: {
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            options: {
              type: 'string'
            },
            id: {
              type: 'string',
              relation: 'dsQuery/items'
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
     * @param {string} param.dsSectionId - Section to overwrite with query
     */
    addToSection ({ id, dsSectionId }) {
      this.$setDataValue('dsSection/query', id, {
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
            const where = this.$getDataValue('dsQuery/where', { id })
            const sort = this.$getDataValue('dsQuery/sort', { id })

            const currentSection = {}

            // collect current widgets
            for (let i = 0; i < result.item.length; i++) {
              currentSection[result.item[i]] = true
            }

            if (!where.isEmpty) {
              const queryData = this.$getDataValue('dsQuery/items', { id: where.item.id })

              if (queryData.isEmpty) {
                console.error('where query should not be empty')

                return this.$setDataValue('dsQuery/items', [], { id: where.item.id })
              }

              const query = []

              // update query widget list
              for (let i = 0; i < queryData.item.length; i++) {
                const item = queryData.item[i]

                if (currentSection[item.widgetId]) {
                  query.push(item)

                  currentSection[item.widgetId] = false
                }
              }

              this.$setDataValue('dsQuery/items', query, {
                id: where.item.id
              })
            }

            if (!sort.isEmpty) {
              const queryData = this.$getDataValue('dsQuery/items', { id: sort.item.id })

              if (queryData.isEmpty) {
                console.error('sort query should not be empty')

                return this.$setDataValue('dsQuery/items', [], { id: sort.item.id })
              }

              const query = []

              // update query widget list
              for (let i = 0; i < queryData.item.length; i++) {
                const item = queryData.item[i]

                if (currentSection[item.widgetId]) {
                  query.push(item)

                  currentSection[item.widgetId] = false
                }
              }

              this.$setDataValue('dsQuery/items', query, {
                id: sort.item.id
              })
            }
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
    fetch ({ id }) {
      const where = this.$getDataValue('dsQuery/where', { id })
      const sort = this.$getDataValue('dsQuery/sort', { id })

      if (!where.isEmpty) {
        const queryData = this.$getDataValue('dsQuery/items', { id: where.item.id })
        let items = this._fetchValues(queryData.item)
        const whereResults = this._where(items, where.item.options)

        items = whereResults.items

        if (!sort.isEmpty) {
          const queryData = this.$getDataValue('dsQuery/items', { id: sort.item.id })
          items = []

          // filter where results
          for (let i = 0; i < queryData.item.length; i++) {
            const item = queryData.item[i]

            if (whereResults.usedWidgets[item.widgetId]) {
              items.push(item)
            }
          }

          items = this._fetchValues(items)
          items = this._sort(items, sort.item.options)
        }

        return items
      }

      if (!sort.isExpandEmpty) {
        let items = this._fetchValues(sort.expand[0].item)

        items = this._sort(items, sort.item.options)

        return items
      }
    },
    /**
     * Fetch content values
     * @private
     * @param {QueryItem[]} items
     * @returns {QueryValue[]}
     */
    _fetchValues (items) {
      const result = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const content = this.$getDataValue('dsContent/items', { id: item.contentId })
        let contentValue = content.item.values

        for (let i = 0; i < item.content.length; i++) {
          const property = item.content[i]

          if (content.item.tokens[property]) {
            // process token value
          }

          contentValue = contentValue[property]
        }

        result.push({
          value: contentValue,
          widgetId: item.widgetId
        })
      }

      return result
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
      return item.sort(this._sortDescending)
    },
    /**
     * Filter items based on conditions
     * @private
     * @param {*[]} items
     * @param {QueryWhere[]} options
     * @returns {Object}
     */
    _where (items, options) {
      const result = {
        items: [],
        usedWidgets: {}
      }

      /* eslint no-labels: ["error", { "allowLoop": true }] */
      filter: for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (options.length > 1) {
          for (let i = 0; i < options.length; i++) {
            const option = options[i]

            // compare one or more results
            const compareValues = []

            const item = option[i]
            let compareItem = item

            if (typeof item !== 'string') {
              compareItem = this.$method('dsOperator/eval', {
                name: item.name,
                values: [item.value, item.value]
              })
            }

            compareValues.push(compareItem)

            const isValid = this.$method('dsOperator/compare', compareValues)

            if (!isValid) {
              continue filter
            }
          }
        } else {
          const isValid = this.$method('dsOperator/eval', {
            name: options[0].name,
            values: [item.value, options[0].value]
          })

          if (!isValid) {
            continue filter
          }
        }

        result.items.push(item)
        result.usedWidgets[item.widgetId] = true
      }

      return result
    }
  }
})

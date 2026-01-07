import { createPlugin } from '@dooksa/create-plugin'
import { listFilter, listSort, stateAddListener, stateSetValue, stateGetValue } from '#client'

/**
 * @typedef {Object} QueryItem
 * @property {string} contentId - The content item ID to fetch values from
 * @property {string} widgetId - The widget ID associated with this query item
 * @property {string[]} content - Array of property paths to navigate through content values
 */

/**
 * @typedef {Object} QueryValue
 * @property {*} value - The extracted content value
 * @property {string} widgetId - The widget ID associated with the value
 */

/**
 * @typedef {Object} QueryWhere
 * @property {Array} options - Filter options for the query
 * @property {string} id - Reference ID to query items collection
 */

/**
 * @typedef {Object} QuerySort
 * @property {string} options - Sort type/order options
 * @property {string} id - Reference ID to query items collection
 */

/**
 * Query Plugin
 *
 * Provides functionality for filtering and sorting content items based on query configurations.
 * The plugin manages query collections that can filter and sort widget content values.
 *
 * @module query
 * @example
 * // Filter content in a section
 * queryFilter({ id: 'myQuery', sectionId: 'mySection' })
 *
 * // Fetch filtered and sorted values
 * const values = queryFetch({ id: 'myQuery' })
 */
export const query = createPlugin('query', {
  metadata: {
    title: 'Query',
    description: 'Filter and sort content items based on query configurations',
    icon: 'mdi:filter-variant'
  },
  privateMethods: {
    /**
     * Fetches content values for query items by navigating through content property paths.
     * @private
     * @param {QueryItem[]} items - Array of query items containing content references
     * @returns {QueryValue[]} Array of extracted values with widget associations
     */
    fetchValues (items) {
      const result = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const content = stateGetValue({
          name: 'content/items',
          id: item.contentId
        })
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
    }
  },
  state: {
    schema: {
      items: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              contentId: {
                type: 'string',
                relation: 'content/items'
              },
              widgetId: {
                type: 'string',
                relation: 'widget/items'
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
      },
      where: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            options: {
              type: 'array'
            },
            id: {
              type: 'string',
              relation: 'query/items'
            }
          }
        }
      },
      sort: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            options: {
              type: 'string'
            },
            id: {
              type: 'string',
              relation: 'query/items'
            }
          }
        }
      }
    }
  },
  actions: {
    filter: {
      metadata: {
        title: 'Filter Query',
        description: 'Apply query filter to a section and update widget items dynamically'
      },
      /**
       * Applies a query filter to a section by setting up listeners to update widget items
       * when section content changes. Filters query items to only include those present
       * in the specified section.
       * @param {Object} params - The parameters for the filter action
       * @param {string} params.id - The query ID containing filter/sort configuration
       * @param {string} params.sectionId - The section ID to apply the query to
       * @returns {void}
       */
      method ({ id, sectionId }) {
        stateSetValue({
          name: 'section/query',
          value: id,
          options: {
            id: sectionId
          }
        })

        const mode = stateGetValue({
          name: 'section/mode',
          id: sectionId
        })

        if (!mode.isEmpty) {
          sectionId = sectionId + mode.item
        }

        stateAddListener({
          name: 'section/items',
          on: 'update',
          id: sectionId,
          priority: 1,
          handler: (result) => {
            const where = stateGetValue({
              name: 'query/where',
              id
            })
            const sort = stateGetValue({
              name: 'query/sort',
              id
            })

            const currentSection = {}

            // collect current widgets
            for (let i = 0; i < result.item.length; i++) {
              currentSection[result.item[i]] = true
            }

            if (!where.isEmpty) {
              const queryData = stateGetValue({
                name: 'query/items',
                id: where.item.id
              })

              if (queryData.isEmpty) {
                console.error('where query should not be empty')

                return stateSetValue({
                  name: 'query/items',
                  value: [],
                  options: { id: where.item.id }
                })
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

              stateSetValue({
                name: 'query/items',
                value: query,
                options: {
                  id: where.item.id
                }
              })
            }

            if (!sort.isEmpty) {
              const queryData = stateGetValue({
                name: 'query/items',
                id: sort.item.id
              })

              if (queryData.isEmpty) {
                console.error('sort query should not be empty')

                return stateSetValue({
                  name: 'query/items',
                  value: [],
                  options: {
                    id: sort.item.id
                  }
                })
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

              stateSetValue({
                name: 'query/items',
                value: query,
                options: {
                  id: sort.item.id
                }
              })
            }
          }
        })
      }
    },
    fetch: {
      metadata: {
        title: 'Fetch Query',
        description: 'Fetch and process content values based on query configuration'
      },
      /**
       * Fetches and processes content values based on query configuration.
       * Applies filtering and sorting to query items and returns the processed results.
       * @param {Object} params - The parameters for the fetch action
       * @param {string} params.id - The query ID containing where/sort configuration
       * @returns {QueryValue[]} Array of processed query values with filtering and sorting applied
       */
      method ({ id }) {
        const where = stateGetValue({
          name: 'query/where',
          id
        })
        const sort = stateGetValue({
          name: 'query/sort',
          id
        })

        if (!where.isEmpty) {
          const queryData = stateGetValue({
            name: 'query/items',
            id: where.item.id
          })
          let items = this.fetchValues(queryData.item)
          const whereResults = listFilter({
            items,
            options: where.item.options
          })

          items = whereResults.items

          if (!sort.isEmpty) {
            const queryData = stateGetValue({
              name: 'query/items',
              id: sort.item.id
            })

            // filter where results to get QueryItem[]
            const filteredQueryItems = []
            for (let i = 0; i < queryData.item.length; i++) {
              const item = queryData.item[i]

              if (whereResults.usedWidgets[item.widgetId]) {
                filteredQueryItems.push(item)
              }
            }

            // fetch values from filtered items
            items = this.fetchValues(filteredQueryItems)
            // sort the QueryValue[] results
            items = listSort({
              items,
              type: sort.item.options
            })
          }

          return items
        }

        if (!sort.isExpandEmpty) {
          let items = this.fetchValues(sort.expand[0].item)

          items = listSort({
            items,
            type: sort.item.options
          })

          return items
        }
      }
    }
  }
})

export const {
  queryFetch,
  queryFilter
} = query

export default query

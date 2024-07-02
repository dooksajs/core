import createPlugin from '@dooksa/create-plugin'
import { listFilter, listSort, $addDataListener, $setDataValue, $getDataValue } from './index.js'


/**
 * Fetch content values
 * @private
 * @param {QueryItem[]} items
 * @returns {QueryValue[]}
 */
function fetchValues (items) {
  const result = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const content = $getDataValue('content/items', { id: item.contentId })
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

const query = createPlugin('query', {
  metadata: {
    plugin: {
      title: 'Query',
      description: 'Filter and sort',
      icon: 'mdi:filter-variant'
    }
  },
  models: {
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
  },
  actions: {
    /**
     * Append query to section
     * @param {Object} param
     * @param {string} param.id - Query Id
     * @param {string} param.sectionId - Section to overwrite with query
     */
    filter ({ id, sectionId }) {
      $setDataValue('section/query', id, {
        id: sectionId
      })

      const mode = $getDataValue('section/mode', { id: sectionId })

      if (!mode.isEmpty) {
        sectionId = sectionId + mode.item
      }

      $addDataListener('section/items', {
        on: 'update',
        id: sectionId,
        priority: 1,
        handler: (result) => {
          const where = $getDataValue('query/where', { id })
          const sort = $getDataValue('query/sort', { id })

          const currentSection = {}

          // collect current widgets
          for (let i = 0; i < result.item.length; i++) {
            currentSection[result.item[i]] = true
          }

          if (!where.isEmpty) {
            const queryData = $getDataValue('query/items', { id: where.item.id })

            if (queryData.isEmpty) {
              console.error('where query should not be empty')

              return $setDataValue('query/items', [], { id: where.item.id })
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

            $setDataValue('query/items', query, {
              id: where.item.id
            })
          }

          if (!sort.isEmpty) {
            const queryData = $getDataValue('query/items', { id: sort.item.id })

            if (queryData.isEmpty) {
              console.error('sort query should not be empty')

              return $setDataValue('query/items', [], { id: sort.item.id })
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

            $setDataValue('query/items', query, {
              id: sort.item.id
            })
          }
        }
      })
    },
    /**
     * Fetch values by query
     * @param {Object} param
     * @param {string} param.id - Query Id
     * @returns {QueryValue[]}
     */
    fetch ({ id }) {
      const where = $getDataValue('query/where', { id })
      const sort = $getDataValue('query/sort', { id })

      if (!where.isEmpty) {
        const queryData = $getDataValue('query/items', { id: where.item.id })
        let items = fetchValues(queryData.item)
        const whereResults = listFilter({ items, options: where.item.options })

        items = whereResults.items

        if (!sort.isEmpty) {
          const queryData = $getDataValue('query/items', { id: sort.item.id })
          items = []

          // filter where results
          for (let i = 0; i < queryData.item.length; i++) {
            const item = queryData.item[i]

            if (whereResults.usedWidgets[item.widgetId]) {
              items.push(item)
            }
          }

          items = fetchValues(items)
          items = listSort({ items, type: sort.item.options })
        }

        return items
      }

      if (!sort.isExpandEmpty) {
        let items = fetchValues(sort.expand[0].item)

        items = listSort({ items, type: sort.item.options })

        return items
      }
    }
  }
})

const queryFilter = query.actions.filter
const queryFetch = query.actions.fetch

export {
  query,
  queryFetch,
  queryFilter
}

export default query

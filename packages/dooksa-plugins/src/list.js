import { createPlugin } from '@dooksa/create'
import { actionDispatch, operatorCompare, operatorEval } from './index.js'

/**
 * @typedef {Object} ArraySortContent
 * @property {string} contentId - content/item id
 * @property {string} widgetId - widget/item id
 * @property {string[]} content - The content value position within the content object
 */

/**
 * @typedef {Object} ArrayFilterBy
 * @property {string} name - Name of operator
 * @property {*} value - Value to compare with content value
 */

/**
 * @typedef {('ascending'|'descending')} ArraySortBy
 */

/**
 * @typedef {Object} ArraySortValue
 * @property {(string|number)} value - Content value
 * @property {string} widgetId - widget/item id
 */

const list = createPlugin('list', ({ defineActions, defineActionSchema }) => {
  function sortAscending (a, b) {
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
  }

  function sortDescending (a, b) {
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
  }

  defineActionSchema({
    filter: {
      name: 'Filter',
      description: 'Filter items based on conditions',
      schema: [
        {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                oneOf: [
                  {
                    type: 'string'
                  },
                  {
                    type: 'number'
                  }
                ]
              }
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  value: {
                    type: 'any'
                  }
                }
              }
            }
          }
        }
      ]
    }
  })

  defineActions({
    /**
     * Filter items based on conditions
     * @param {Object} param
     * @param {ArraySortValue[]} param.items
     * @param {ArrayFilterBy[]} param.options
     * @returns {Object}
     */
    filter ({ items, options }) {
      const result = {
        items: [],
        usedWidgets: {}
      }

      filter: for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (options.length > 1) {
          for (let i = 0; i < options.length; i++) {
            const option = options[i]

            // compare one or more results
            const compareValues = []

            let compareItem = option

            if (typeof item !== 'string') {
              compareItem = operatorEval({
                name: option.name,
                values: [item.value, option.value]
              })
            }

            compareValues.push(compareItem)

            const isValid = operatorCompare(compareValues)

            if (!isValid) {
              continue filter
            }
          }
        } else {
          const option = options[0]
          const isValid = operatorEval({
            name: option.name,
            values: [item.value, option.value]
          })

          if (!isValid) {
            continue filter
          }
        }

        result.items.push(item)
        result.usedWidgets[item.widgetId] = true
      }

      return result
    },
    /**
     * Executes a provided action once for each array element.
     * @param {Object} param
     * @param {Object} param.context - Context for action, A new property named "_list_" is created with the data type of the "item"
     * @param {Array|Object} param.items - Array used for iteration
     * @param {string} param.actionId - Action ID used to execute
     * @param {boolean} param.async - Indicates the iteration will return a promise
     * @returns {Array|Promise}
     */
    forEach ({ context, items, actionId, async }) {
      context._list_ = {}

      if (Array.isArray(items)) {
        context._list_ = []
      }

      if (async) {
        return new Promise((resolve, reject) => {
          const promises = []

          for (const key in items) {
            if (Object.hasOwnProperty.call(items, key)) {
              const promise = new Promise((resolve, reject) => {
                actionDispatch({
                  id: actionId,
                  context,
                  payload: {
                    key,
                    value: items[key]
                  }
                }, {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error)
                })
              })

              promises.push(promise)
            }
          }

          Promise.all(promises)
            .then(() => resolve(context._list_))
            .catch(error => reject(error))
        })
      }

      for (const key in items) {
        if (Object.hasOwnProperty.call(items, key)) {
          actionDispatch({
            id: actionId,
            context,
            payload: {
              key,
              value: items[key]
            }
          })
        }
      }

      return context._list_
    },
    /**
     * Adds the specified elements to the end of an array
     * @param {Object} param
     * @param {Array} param.target - Array which the new element will be appended
     * @param {*} param.source - The element that will be appended to the end of the array
     */
    push ({ target, source }) {
      target.push(source)
    },
    /**
     * Sort list
     * @param {Object} param
     * @param {ArraySortValue[]} param.items
     * @param {ArraySortBy} param.type - Sort by
     * @returns {ArraySortValue[]}
     */
    sort ({ items, type }) {
      if (type === 'ascending') {
        return items.sort(sortAscending)
      } else if (type === 'descending') {
        return items.sort(sortDescending)
      } else {
        throw new Error('Sort method does not exist: ' + type )
      }
    },
    /**
     * Changes the contents of an array by removing or replacing existing elements and/or adding new elements in place
     * @param {Object} param
     * @param {Array} param.target - The array which will be modified
     * @param {*} param.source - The elements to add to the array, beginning from start.
     * @param {number} param.start - Zero-based index at which to start changing the array, converted to an integer.
     * @param {number} param.deleteCount - An integer indicating the number of elements in the array to remove from start.
     * @returns {Array}
     */
    splice ({ target, source, start, deleteCount = 0 }) {
      if (start == null) {
        return target.splice(0)
      }

      if (Array.isArray(source)) {
        return target.splice(start, deleteCount, ...source)
      }

      return target.splice(start, deleteCount, source)
    }
  })
})

const listFilter = list.actions.filter
const listForEach = list.actions.forEach
const listPush = list.actions.push
const listSort = list.actions.sort
const listSplice = list.actions.splice

export {
  listFilter,
  listForEach,
  listPush,
  listSort,
  listSplice
}

export default list

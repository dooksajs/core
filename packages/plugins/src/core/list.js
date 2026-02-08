import { createPlugin } from '@dooksa/create-plugin'
import { actionDispatch, errorLogError, operatorCompare, operatorEval } from '#core'

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

/**
 * @typedef {Object} CompareItem
 * @property {*} value_1 - First value to compare
 * @property {*} value_2 - Second value to compare
 * @property {'&&'|'||'} op - Logical operator
 */

/**
 * Sorts an array in ascending order.
 * Handles both string and non-string values, with case-insensitive string comparison.
 *
 * @param {Object} a - First item to compare
 * @param {string|number} a.value - The value to compare
 * @param {Object} b - Second item to compare
 * @param {string|number} b.value - The value to compare
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 */
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

/**
 * Sorts an array in descending order.
 * Handles both string and non-string values, with case-insensitive string comparison.
 *
 * @param {Object} a - First item to compare
 * @param {string|number} a.value - The value to compare
 * @param {Object} b - Second item to compare
 * @param {string|number} b.value - The value to compare
 * @returns {number} -1 if a > b, 1 if a < b, 0 if equal
 */
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

/**
 * Helper object for mapping array/object items to key-value pairs.
 */
const mapKeyValue = {
  /**
   * Maps array item to key-value pair.
   * @param {number} i - Array index
   * @param {Array} items - Array being mapped
   * @returns {{key: number, value: *}} Key-value pair
   */
  array (i, items) {
    return {
      key: i,
      value: items[i]
    }
  },
  /**
   * Maps object entry to key-value pair.
   * @param {number} i - Index in entries array
   * @param {Array} items - Object entries array
   * @returns {{key: string, value: *}} Key-value pair
   */
  object (i, items) {
    return {
      key: items[i][0],
      value: items[i][1]
    }
  }
}

export const list = createPlugin('list', {
  metadata: {
    title: 'List',
    description: 'Manage a collection of data.',
    icon: 'mdi:application-array'
  },
  actions: {
    filter: {
      metadata: {
        title: 'Filter list',
        description: 'Create a new filtered list.',
        icon: 'mdi:filter'
      },
      /**
       * Filter items based on conditions using operators.
       * Supports multiple conditions with AND/OR logic.
       *
       * @param {Object} param - Parameters for filtering
       * @param {ArraySortValue[]} param.items - Items to filter
       * @param {ArrayFilterBy[]} param.options - Filter conditions with operator and value
       * @returns {{items: ArraySortValue[], usedWidgets: Object<string, boolean>}} Filtered items and widget lookup
       */
      method ({ items, options }) {
        const result = {
          items: [],
          usedWidgets: {}
        }

        // If no options provided, return empty result (no items match)
        if (options.length === 0) {
          return result
        }

        filter: for (let i = 0; i < items.length; i++) {
          const item = items[i]

          if (options.length > 1) {
            let compareValues = []
            /** @type {CompareItem} */
            let compareItem = {
              value_1: null,
              value_2: null,
              op: '&&'
            }

            for (let i = 0; i < options.length; i++) {
              const option = options[i]
              const value = operatorEval({
                name: /** @type {import('#client').Operator} */ (option.name),
                values: [item.value, option.value]
              })

              if (compareItem.value_1 === null) {
                compareItem.value_1 = value
              } else if (compareItem.value_2 === null) {
                compareItem.value_2 = value
                compareValues.push(compareItem)
                compareItem = {
                  value_1: null,
                  value_2: null,
                  op: '&&'
                }
              }
            }

            const isValid = operatorCompare(compareValues)

            if (!isValid) {
              continue filter
            }

            compareValues = []
          } else {
            const option = options[0]
            const isValid = operatorEval({
              name: /** @type {import('#client').Operator} */ (option.name),
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
      }
    },
    map: {
      metadata: {
        title: 'Map',
        description: 'Iterate a list and optionally map values to a new list.',
        icon: 'mdi:reiterate'
      },
      /**
       * Executes a provided action once for each array element.
       * @param {Object} param
       * @param {Object} param.context - Context for action, A new property named "$list" is created with the data type of the "item"
       * @param {Array|Object} param.items - Array used for iteration
       * @param {string} param.actionId - Action ID used to execute
       * @returns {Promise}
       */
      method ({ context, items, actionId }, action) {
        let length = items.length
        let method = 'array'
        context = context || action.context

        // process array
        if (Array.isArray(items)) {
          context.$list = []
        } else {
          // process object
          method = 'object'
          items = Object.entries(items)
          length = items.length
          context.$list = {}
        }

        return new Promise((resolve, reject) => {
          const promises = []

          for (let i = 0; i < items.length; i++) {
            const result = mapKeyValue[method](i, items)

            promises.push(actionDispatch({
              id: actionId,
              context,
              payload: {
                key: result.key,
                value: result.value,
                items,
                length
              },
              clearBlockValues: false
            }))
          }

          Promise.all(promises)
            .then(() => resolve(context.$list))
            .catch(error => reject(error))
        })
      }
    },
    indexOf: {
      metadata: {
        title: 'Index number',
        description: 'Retrieve the first index at which the given value can be found.',
        icon: 'mdi:number-0-box-multiple-outline'
      },
      /**
       * Returns the first index at which a given element can be found in the array, or -1 if it is not present.
       * @param {Object} param - Parameters for finding the index
       * @param {Array} param.items - Array to search within
       * @param {number|string} param.value - Value to find in the array
       * @returns {number} Index of the value, or -1 if not found
       */
      method ({ items, value }) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          if (item === value) {
            return i
          }
        }

        return -1
      }
    },
    push: {
      metadata: {
        title: 'Push value to list',
        description: 'Adds the specified value to the end of an array.',
        icon: 'mdi:format-list-group-plus'
      },
      /**
       * Adds the specified elements to the end of an array
       * @param {Object} param - Parameters for push operation
       * @param {Array} param.target - Array which the new element will be appended
       * @param {*} param.source - The element that will be appended to the end of the array
       * @returns {number} New length of the array
       */
      method ({ target, source }) {
        return target.push(source)
      }
    },
    sort: {
      metadata: {
        title: 'Sort list',
        description: 'Sort list ascending or descending',
        icon: 'mdi:sort'
      },
      /**
       * Sort list ascending or descending
       * @param {Object} param
       * @param {Array} param.items
       * @param {ArraySortBy} param.type - Sort by
       * @returns {ArraySortValue[]}
       */
      method ({ items, type }) {
        if (type === 'ascending') {
          return items.sort(sortAscending)
        } else if (type === 'descending') {
          return items.sort(sortDescending)
        }

        errorLogError({
          message: 'Sort method does not exist: ' + type,
          level: 'ERROR',
          code: 'SORT_METHOD_ERROR',
          category: 'LIST',
          context: {
            plugin: 'list',
            action: 'sort'
          }
        })

        return items
      }
    },
    splice: {
      metadata: {
        title: 'Splice list',
        description: 'Remove or replace existing values and/or adding new values',
        icon: 'mdi:list-status'
      },
      /**
       * Remove or replace existing values and/or adding new values
       * @param {Object} param - Parameters for splice operation
       * @param {Array} param.target - The array which will be modified
       * @param {*} param.source - The elements to add to the array, beginning from start.
       * @param {number} param.start - Zero-based index at which to start changing the array, converted to an integer.
       * @param {number} param.deleteCount - An integer indicating the number of elements in the array to remove from start.
       * @returns {Array} Array of removed elements
       */
      method (args) {
        const { target, start } = args
        // Use 'in' operator to check presence
        const hasSource = 'source' in args
        const hasDeleteCount = 'deleteCount' in args
        const source = args.source
        const deleteCount = args.deleteCount

        if (start == null) {
          if (source !== undefined) {
            errorLogError({
              message: 'Splice with source expects a start position but found ' + start,
              level: 'ERROR',
              code: 'SPLICE_METHOD_ERROR',
              category: 'LIST',
              context: {
                plugin: 'list',
                action: 'splice'
              }
            })
            return []
          }

          return target.splice(0)
        }

        // Prepare arguments for splice
        const spliceArgs = [start]

        if (hasDeleteCount) {
          spliceArgs.push(deleteCount)
        } else {
          // If source is provided, we MUST provide deleteCount to splice.
          // Default to 0 if inserting.
          if (hasSource) {
            spliceArgs.push(0)
          }
        }

        if (hasSource) {
          // Ensure deleteCount is pushed if not already
          if (spliceArgs.length === 1) spliceArgs.push(0)

          if (Array.isArray(source)) {
            spliceArgs.push(...source)
          } else {
            spliceArgs.push(source)
          }
        }

        return target.splice(...spliceArgs)
      }
    }
  }
})

export const {
  listFilter,
  listPush,
  listSort,
  listSplice,
  listIndexOf,
  listMap
} = list

export default list

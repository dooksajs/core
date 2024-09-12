import createPlugin from '@dooksa/create-plugin'
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

const list = createPlugin('list', {
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
       * Filter items based on conditions
       * @param {Object} param
       * @param {ArraySortValue[]} param.items
       * @param {ArrayFilterBy[]} param.options
       * @returns {Object}
       */
      method ({ items, options }) {
        const result = {
          items: [],
          usedWidgets: {}
        }

        filter: for (let i = 0; i < items.length; i++) {
          const item = items[i]

          if (options.length > 1) {
            let compareValues = []
            /**
             * @type {Object}
             * @property {*} value_1
             * @property {*} value_2
             * @property {'&&'|'||'} op
             */
            let compareItem = {}

            for (let i = 0; i < options.length; i++) {
              const option = options[i]
              const value = operatorEval({
                name: option.name,
                values: [item.value, option.value]
              })

              if (!compareItem.value_1) {
                compareItem.value_1 = value
              }

              if (!compareItem.value_2) {
                compareItem.op = '&&'
                compareItem.value_2 = value
                compareValues.push(compareItem)
                compareItem = {}
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

        context = context || action.context

        if (Array.isArray(items)) {
          context.$list = []
        } else {
          items = Object.keys(items)
          length = items.length
          context.$list = {}
        }

        return new Promise((resolve, reject) => {
          const promises = []

          for (let i = 0; i < items.length; i++) {
            promises.push(actionDispatch({
              id: actionId,
              context,
              payload: {
                key: i,
                value: items[i],
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
       * s returns the first index at which a given element can be found in the array, or -1 if it is not present.
       * @param {Object} param
       * @param {Array} param.items
       * @param {number|string} param.value
       * @returns {number}
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
       * @param {Object} param
       * @param {Array} param.target - Array which the new element will be appended
       * @param {*} param.source - The element that will be appended to the end of the array
       */
      method ({ target, source }) {
        target.push(source)
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

        throw new Error('Sort method does not exist: ' + type )
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
       * @param {Object} param
       * @param {Array} param.target - The array which will be modified
       * @param {*} param.source - The elements to add to the array, beginning from start.
       * @param {number} param.start - Zero-based index at which to start changing the array, converted to an integer.
       * @param {number} param.deleteCount - An integer indicating the number of elements in the array to remove from start.
       * @returns {Array}
       */
      method ({ target, source, start, deleteCount = 0 }) {
        if (start == null) {
          if (source !== undefined) {
            throw new Error('Splice with source expects a start position but found ' + start)
          }

          return target.splice(0)
        }

        if (Array.isArray(source)) {
          return target.splice(start, deleteCount, ...source)
        }

        return target.splice(start, deleteCount, source)
      }
    }
  }
})

const listFilter = list.actions.filter
const listForEach = list.actions.forEach
const listPush = list.actions.push
const listSort = list.actions.sort
const listSplice = list.actions.splice

export {
  list,
  listFilter,
  listForEach,
  listPush,
  listSort,
  listSplice
}

export default list

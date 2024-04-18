import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {Object} ArraySortContent
 * @property {string} contentId - dsContent/item id
 * @property {string} widgetId - dsWidget/item id
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
 * @property {string} widgetId - dsWidget/item id
 */

export default definePlugin({
  name: 'dsList',
  version: 1,
  methods: {
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

      /* eslint no-labels: ["error", { "allowLoop": true }] */
      filter: for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (options.length > 1) {
          for (let i = 0; i < options.length; i++) {
            const option = options[i]

            // compare one or more results
            const compareValues = []

            let compareItem = option

            if (typeof item !== 'string') {
              compareItem = this.$method('dsOperator/eval', {
                name: option.name,
                values: [item.value, option.value]
              })
            }

            compareValues.push(compareItem)

            const isValid = this.$method('dsOperator/compare', compareValues)

            if (!isValid) {
              continue filter
            }
          }
        } else {
          const option = options[0]
          const isValid = this.$method('dsOperator/eval', {
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
     * Find the indexes of objects within a list by key value pairs
     * @param {Object} findByKeyValue - The Object containing the params
     * @param {*[]} findByKeyValue.list - An array of objects
     * @param {string} findByKeyValue.key - The key used to compare
     * @param {[string, number]} findByKeyValue.valueIndex - The value uses to compare and the index starting point
     * @returns {[number, number]} An array with the start and end numbered indexes, -1 indicates there was only 1 item found within a group
     */
    findByKeyValue ({ list, key, valueIndex }) {
      const value = valueIndex[0]
      const index = valueIndex[1] || 0
      const hasValue = (i) => (list[i] && list[i][key] === value)
      const rangeItem = []

      for (let i = index; i < list.length; i++) {
        const item = list[i]

        if (item[key] === value) {
          const nextIndex = i + 1

          if (rangeItem.length) {
            if (!hasValue(nextIndex)) {
              rangeItem.push(i)

              return rangeItem
            }
          } else {
            let prevIndex = i - 1

            if (index && hasValue(prevIndex)) {
              while (hasValue(prevIndex)) {
                prevIndex--
              }

              rangeItem.push(prevIndex + 1)

              // check if item is not in a group
              if (!hasValue(nextIndex)) {
                rangeItem.push(i)

                return rangeItem
              }
            } else {
              rangeItem.push(i)

              // check if item is not in a group
              if (!hasValue(nextIndex)) {
                rangeItem.push(i)

                return rangeItem
              }

              // if last item in the list push the rangeItem
              if (nextIndex === list.length) {
                rangeItem.push(i)

                return rangeItem
              }
            }
          }
        }
      }
    },
    push ({ target, source }) {
      target.push(source)
    },
    splice ({ target, source, start, deleteCount = 0 }) {
      if (start == null) {
        return target.splice()
      }

      if (Array.isArray(source)) {
        return target.splice(start, deleteCount, ...source)
      }

      return target.splice(start, deleteCount, source)
    },
    iterate ({ context, items, dsActionId, async }) {
      if (async) {
        return new Promise((resolve, reject) => {
          const promises = []

          for (const key in items) {
            if (Object.hasOwnProperty.call(items, key)) {
              const promise = new Promise((resolve, reject) => {
                this.$action('dsAction/dispatch', {
                  id: dsActionId,
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
            .then(() => resolve())
            .catch(error => reject(error))
        })
      }

      for (const key in items) {
        if (Object.hasOwnProperty.call(items, key)) {
          this.$method('dsAction/dispatch', {
            id: dsActionId,
            context,
            payload: {
              key,
              value: items[key]
            }
          })
        }
      }
    },
    },
    /**
     * Move a group of items to a new position in an array
     * @param {Object} arrayMove - The Object containing the data to move a group of items within an array
     * @param {*[]} arrayMove.list - The source array
     * @param {number[]} arrayMove.items - A list of indexes that need to move
     * @param {number} arrayMove.index - The location the items will move to within the array
     * @returns {Array} - New transformed array
     */
    move ({ list, items, index }) {
      const length = items.length
      let indexEnd = index - (length - 1)

      if (indexEnd > list.length - 1 || (indexEnd < 0 && index < 0)) {
        return
      } else if (indexEnd <= 0 && index >= 0) {
        indexEnd = index
      }

      const listMiddle = []
      // Create middle of array with new group items
      for (let i = 0; i < length; i++) {
        listMiddle.push(list[items[i]])
      }

      items.sort((a, b) => a - b)
      const startList = list
      let offset = 1
      // Remove moved items
      for (let i = 0; i < length; i++) {
        startList.splice(items[i], 1)

        const nextIndex = i + 1
        if (nextIndex < length) {
          items[nextIndex] = items[nextIndex] - offset
          ++offset
        }
      }
      // Create end of array
      const listEnd = startList.splice(indexEnd)

      return startList.concat(listMiddle, listEnd)
    },
    /**
     * Merge items into array with the option to flatten
     * @param {Object} arrayMerge - The Object containing the data to merge items into an array
     * @param {array} arrayMerge.list - The source array
     * @param {Object[]} arrayMerge.items - An array of objects which contains the item and position it should be placed into the array
     * @param {*} arrayMerge.items[].value - The value to be merged into the original array
     * @param {number} arrayMerge.items[]._$index - The index the value will be placed into the original array
     * @param {number} arrayMerge.flat - Flatten height
     * @returns {Array} - A new list
     */
    merge ({ list, items, flat }) {
      let offset = 0
      items.sort((a, b) => a._$index - b._$index)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const index = item._$index + offset
        delete item._$index
        const listMiddle = [item]
        const listEnd = list.splice(index)
        list = list.concat(listMiddle, listEnd)
        ++offset
      }

      if (flat) {
        list = list.flat(flat)
      }

      return list
    },
    /**
     * Find the next key value pair in a list
     * @param {Object} nextKeyValue - The Object containing the params
     * @param {*[]} nextKeyValue.list - An array of objects
     * @param {string} nextKeyValue.key - The key used to compare
     * @param {number} nextKeyValue.index - The index starting point
     * @returns {[*, number]} An array with the found value and index
     */
    nextKeyValue ({ list, key, index = 0 }) {
      const currentValue = list[index][key]

      for (let i = index; i < list.length; i++) {
        if (list[i][key] !== currentValue) {
          return [list[i][key], i]
        }
      }

      return [currentValue, index]
    },
    /**
     * Find the previous key value pair in a list
     * @param {Object} prevKeyValue - The Object containing the params
     * @param {*[]} prevKeyValue.list - An array of objects
     * @param {string} prevKeyValue.key - The key used to compare
     * @param {number} prevKeyValue.index - The index starting point
     * @returns {[*, number]} An array with the found value and index
     */
    prevKeyValue ({ list, key, index = 0 }) {
      const currentValue = list[index][key]

      for (let i = index; i >= 0; i--) {
        if (list[i][key] !== currentValue) {
          return [list[i][key], i]
        }
      }

      return [currentValue, index]
    },
    /**
     * Remove items from an array
     * @param {Object} arrayRemove - The Object containing the data to remove a group of items from an array
     * @param {*[]} arrayRemove.list - The source array
     * @param {number[]} arrayRemove.items - A list of indexes that will be removed
     */
    remove ({ list, items }) {
      const newList = []

      for (let i = 0; i < list.length; i++) {
        let hasItem = false

        for (let j = 0; j < items.length; j++) {
          if (i === items[j]) {
            hasItem = true
            break
          }
        }

        if (!hasItem) {
          newList.push(list[i])
        }
      }

      return newList
    },
    /**
     * Sort list
     * @param {Object} param
     * @param {ArraySortValue[]} param.items
     * @param {ArraySortBy} param.type - Sort by
     * @returns {ArraySortValue[]}
     */
    sort ({ items, type }) {
      const methodName = '_sort/by/' + type

      if (typeof this[methodName] === 'function') {
        return this[methodName](items)
      } else {
        this.$log('error', { message: 'Sort method does not exist: ' + methodName })
      }
    },
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
     * @param {ArraySortValue[]} item
     * @returns {ArraySortValue[]}
     */
    '_sort/by/ascending' (item) {
      return item.sort(this._sortAscending)
    },
    /**
     * Sort by descending
     * @private
     * @param {ArraySortValue[]} item
     * @returns {ArraySortValue[]}
     */
    '_sort/by/descending' (item) {
      return item.sort(this._sortDescending)
    }
  }
})

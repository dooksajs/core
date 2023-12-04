import { deepClone } from '@dooksa/utils'

/**
 * Data result
 * @param {string} [collection=''] - Collection name
 * @param {string} [id=''] - Document id
 */
function DataResult (collection = '', id = '') {
  this.id = id
  this.collection = collection
  this.isEmpty = false
  this.isCollectionEmpty = false
  this.isAffixEmpty = true
  this.item = undefined
  this.metadata = undefined
  this.previous = undefined

  Object.defineProperty(this, 'noAffixId', {
    get () {
      let noAffixId = this.id.split('_')

      if (noAffixId.length === 3) {
        noAffixId = '_' + noAffixId[1] + '_'
      } else {
        noAffixId = this.id
      }

      return noAffixId
    }
  })
}

/**
 * Deep copy result data
 * @returns {*}
 */
DataResult.prototype.clone = function () {
  if (Array.isArray(this.item)) {
    return deepClone([], this.item)
  }

  if (this.item.constructor === Object) {
    return deepClone({}, this.item)
  }

  return this.item
}

export default DataResult

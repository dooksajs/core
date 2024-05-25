import { deepClone } from '@dooksa/utils'

/**
 * The data result from dsData
 * @constructor
 * @param {string} [collection=''] - Collection name
 * @param {string} [id=''] - Document id
 */
function DataResult (collection = '', id = '') {
  this.id = id
  this.collection = collection
  this.isEmpty = true
  this.isExpandEmpty = true
  this.expand = []
  this.expandIncluded = {}
  this.isAffixEmpty = true

  /** @type {(Object|undefined)} */
  this.item = undefined
  /** @type {(Object|undefined)} */
  this.metadata = undefined
  /** @type {(Object|undefined)} */
  this.previous = undefined
}

/**
 * @property {string} noAffixId - The id without affixes
 */
Object.defineProperty(DataResult.prototype, 'noAffixId', {
  get () {
    if (!this.id) {
      return ''
    }

    const splitString = this.id.split('_')
    let noAffixId = ''

    if (splitString.length === 3) {
      noAffixId = '_' + splitString[1] + '_'
    } else {
      noAffixId = this.id
    }

    return noAffixId
  },
  set (value) {
    if (typeof value === 'string') {
      let noAffixId = value.split('_')

      if (noAffixId.length === 3) {
        this.id = '_' + noAffixId[1] + '_'
      } else {
        this.id = noAffixId[0]
      }
    }
  }
})

/**
 * Deep copy result data
 * @returns {*}
 */
DataResult.prototype.clone = function () {
  if (Array.isArray(this.item)) {
    return deepClone([], this.item)
  }

  if (typeof this.item === 'object' && this.item !== null) {
    return deepClone({}, this.item)
  }

  return this.item
}

export default DataResult

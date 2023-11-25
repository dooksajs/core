import { deepClone } from '@dooksa/utils'

function DataResult (collection = '', id = '') {
  this.id = id
  this.collection = collection
  this.isEmpty = false
  this.isCollectionEmpty = false
  this.isAffixEmpty = true

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

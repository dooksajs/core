import typeCheck from './typeCheck'

/**
 * Proxy to check data integrity on set
 * @param {string} namespace - Parent object name if any
 * @param {any} target - Proxy target
 * @returns {Proxy}
 */
export default (namespace = '', target) => {
  return new Proxy(target, {
    set (target, prop, value) {
      typeCheck(namespace, value, prop)

      return Reflect.set(...arguments)
    }
  })
}

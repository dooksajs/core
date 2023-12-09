/**
 * @typedef {Object} GetterValue
 * @property {string} value - Value from node
 * @property {boolean} [token] - Has token
 */

/**
 * Get content value from node
 * @param {Element} node - HTML element or Text node used to get value from
 * @param {'attribute'|'getter'} type - Type of getter
 * @param {string} name - Name of value to get from node
 * @param {boolean} [token] - Check if value has token
 * @return {GetterValue}
 */
export default function (node, type, name, token) {
  // fetch token from string
  if (token) {
    let value

    if (type === 'attribute') {
      value = node.getAttribute(name)
    } else {
      value = _getNodeValueByGetter(node, name)
    }

    return _parseText(value)
  }

  if (type === 'attribute') {
    return { value: node.getAttribute(name) }
  }

  return { value: _getNodeValueByGetter(node, name) }
}

/**
 * Get value from element using a getter
 * @private
 * @param {Object} node - Text or Element node
 * @param {string} name - Getters used to fetch the value from the element
 * @returns {string}
 */
function _getNodeValueByGetter (node, name) {
  let result = ''

  if (node.__lookupGetter__(name)) {
    result = node[name]
  }

  return result
}

/**
 * Check if value has token
 * @private
 * @param {string} value - Value from node
 * @returns {GetterValue}
 */
function _parseText (value) {
  // return empty
  if (value === '[empty]') {
    return {
      value: '',
      token: false
    }
  }

  const pattern = /\[(.+)\]/
  const findToken = new RegExp(pattern, 'g')
  const token = findToken.test(value)

  return { value, token }
}

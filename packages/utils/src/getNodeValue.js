/**
 * Get content value from node
 * @param {'attribute'|'getter'} type - Type of getter
 * @param {HTMLElement|Text} node - HTML element or Text node used to get value from
 * @param {string} contentType - Content type
 * @param {string} getterName - Name of node getter
 * @param {string} getterKey
 */
export default (type, node, contentType, getterName, getterKey = 'value') => {
  if (contentType === 'text') {
    let item

    if (type === 'attribute') {
      item = _getNodeValueByAttribute(node, getterName, getterKey)
    } else {
      item = _getNodeValueByGetter(node, getterName, getterKey)
    }

    return _parseText(item.value)
  }

  if (type === 'attribute') {
    return _getNodeValueByAttribute(node, getterName, getterKey)
  }

  return _getNodeValueByGetter(node, getterName, getterKey)
}

/**
   * Get value from element it's attribute
   * @param {Object} node - Element
   * @param {dsComponentGet} getter - Getters used to fetch the value from the element
   * @returns {string}
   * @private
   */
const _getNodeValueByAttribute = (node, name, key) => {
  return {
    key,
    value: node.getAttribute(name)
  }
}

/**
 * Get value from element using a getter
 * @param {Object} node - Text or Element node
 * @param {strubg} getter - Getters used to fetch the value from the element
 * @param {string} key -
 * @returns {string}
 * @private
 */
const _getNodeValueByGetter = (node, name, key) => {
  const result = { key, value: '' }

  if (node.__lookupGetter__(name)) {
    result.value = node[name]
  }

  return result
}

const _parseText = (text) => {
  // return empty
  if (text === '[empty]') {
    return {
      value: '',
      token: false
    }
  }

  const pattern = /\[(.+)\]/
  const findToken = new RegExp(pattern, 'g')
  const token = findToken.test(text)

  return { value: text, token }
}

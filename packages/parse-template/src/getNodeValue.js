export default (type, node, getterName, getterKey = 'value') => {
  if (type === 'attribute') {
    return _getNodeValueByAttribute(node, getterName, getterKey)
  }

  if (node.nodeName === '#text') {
    const item = _getNodeValueByGetter(node, getterName, getterKey)

    return _parseText(item.value)
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
   * @param {dsComponentGet} getter - Getters used to fetch the value from the element
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

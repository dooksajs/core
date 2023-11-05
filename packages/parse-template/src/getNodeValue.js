export default (type, node, getter) => {
  if (type === 'attribute') {
    return _getNodeValueByAttribute(node, getter)
  }

  if (node.nodeName === '#text') {
    const item = _getNodeValueByGetter(node, getter)

    return _parseText(item.value)
  }

  return _getNodeValueByGetter(node, getter)
}

/**
   * Get value from element it's attribute
   * @param {Object} node - Element
   * @param {dsComponentGet} getter - Getters used to fetch the value from the element
   * @returns {string}
   * @private
   */
const _getNodeValueByAttribute = (node, getter) => {
  if (typeof getter === 'string') {
    return {
      key: 'value',
      value: node.getAttribute(getter)
    }
  }

  return {
    key: getter.key,
    value: node.getAttribute(getter.name)
  }
}

/**
   * Get value from element using a getter
   * @param {Object} node - Text or Element node
   * @param {dsComponentGet} getter - Getters used to fetch the value from the element
   * @returns {string}
   * @private
   */
const _getNodeValueByGetter = (node, getter) => {
  if (typeof getter === 'string') {
    const result = { key: 'value', value: '' }

    if (node.__lookupGetter__(getter)) {
      result.value = node[getter]
    }

    return result
  } else {
    const result = { key: getter.key, value: '' }

    if (node.__lookupGetter__(getter.name)) {
      result.value = node[getter.name]
    }

    return result
  }
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

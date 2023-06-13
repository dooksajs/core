import objectHash from '@dooksa/object-hash'

/**
 * Convert html to dooksa display data
 * @param {Object} source - Template node
 * @param {Object} contentTypes - List of element keys that will be used as content
 * @returns {Object}
 */
export const parseHTML = (
  source,
  contentTypes = {},
  ignoreAttributes = {},
  data = {
    mode: '',
    lang: '',
    id: '',
    component: {},
    event: [],
    content: [],
    section: [],
    layout: [],
    layoutId: [],
    layoutEntry: [],
    index: 0
  },
  head = true
) => {
  let nodeLists = [source]

  if (head) {
    // set metadata
    data.mode = source.getAttribute('ds-mode') || 'default'
    data.lang = source.getAttribute('ds-lang') || 'en'
    data.id = source.getAttribute('ds-id') || ''

    if (source.tagName === 'TEMPLATE') {
      // clone template content
      const fragment = source.content.cloneNode(true)

      // set child nodes
      nodeLists = [fragment.childNodes]
    }
  }

  const section = []
  const event = {}
  const content = []
  const layoutNodes = []
  const layout = []
  const layoutEntry = []
  let layoutIndex = 0

  data.section[data.index] = section
  data.event[data.index] = event
  data.content[data.index] = content
  data.layout[data.index] = layout
  data.layoutEntry[data.index] = layoutEntry

  for (let i = 0; i < nodeLists.length; i++) {
    const nodeList = nodeLists[i]

    for (let j = 0; j < nodeList.length; j++) {
      const node = nodeList[j]
      const isTextNode = node.nodeName === '#text' && node.textContent.trim()

      if (isTextNode || node.tagName) {
        const item = {}
        const component = {}

        if (node.parentElement) {
          const parentIndex = layoutNodes.indexOf(node.parentElement)

          if (parentIndex !== -1) {
            item.parentIndex = parentIndex
          }
        } else {
          layoutEntry.push(layoutIndex)
        }

        if (isTextNode) {
          item.contentIndex = content.length
          component.id = 'text'
          content.push(node)
        } else {
          let hasSection = false

          // set component id
          component.id = node.tagName.toLowerCase()

          if (contentTypes[component.id]) {
            item.contentIndex = content.length
            content.push(node)
          }

          // parse attributes
          if (node.attributes.length) {
            const result = parseAttributes(node.attributes, ignoreAttributes[component.id])

            if (result.bind.on) {
              event[layoutIndex] = result.bind.on
            }

            hasSection = result.bind.hasSection

            if (result.attributes.length) {
              component.attributes = result.attributes
            }
          }

          // prepare child nodes
          if (node.childNodes.length) {
            if (hasSection) {
              // add section
              item.sectionIndex = data.index

              for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i]

                if (childNode.nodeName === '#text' && !childNode.textContent.trim()) {
                  continue
                }

                // increase the data index to exclude the children from the current section
                ++data.index
                // add instance to new section
                section.push(data.index)

                parseHTML([childNode], contentTypes, ignoreAttributes, data, false)
              }
            } else {
              nodeLists.push(node.childNodes)
            }
          }
        }

        const componentId = objectHash(component)

        item.componentId = componentId
        data.component[componentId] = component

        ++layoutIndex

        layout.push(item)
        layoutNodes.push(node)
      }
    }
  }

  // create layout ids
  if (head) {
    for (let i = 0; i < data.layout.length; i++) {
      const layoutId = objectHash(data.layout[i])

      data.layoutId.push(layoutId)
    }
  }

  return data
}

const parseAttributes = (attributes, ignore = []) => {
  const item = {
    attributes: [],
    bind: {}
  }

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    const name = attribute.name
    const value = attribute.value

    if (ignore.includes(name)) {
      continue
    }

    if (name === 'class') {
      const classList = value.split(' ').sort()

      item.attributes.push([name, classList.join(' ')])
    } else if (name.substring(0, 3) === 'ds-') {
      const bind = name.split('-')

      if (bind[1] === 'on') {
        item.bind.on = {
          name: bind.slice(2).join('-'),
          value: value.split(' ')
        }
      } else if (bind[1] === 'section') {
        item.bind.hasSection = true
      }
    } else {
      item.attributes.push([name, value])
    }
  }

  return item
}

export const getNodeValue = (type, node, getter) => {
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
    return { value: node.getAttribute(getter) }
  }

  const value = {}

  for (let i = 0; i < getter.length; i++) {
    const { name, key } = getter[i]

    value[key] = node.getAttribute(name)
  }

  return value
}

/**
 * Get value from element using a getter
 * @param {Object} node - Text or Element node
 * @param {dsComponentGet} getter - Getters used to fetch the value from the element
 * @returns {string}
 * @private
 */
const _getNodeValueByGetter = (node, getter) => {
  const value = {}

  if (typeof getter === 'string') {
    if (node.__lookupGetter__(getter)) {
      return { value: node[getter] }
    } else {
      return { value: '' }
    }
  } else {
    for (let i = 0; i < getter.length; i++) {
      const { name, key } = getter[i]

      if (node.__lookupGetter__(name)) {
        value[key] = node[name]
      } else {
        value[key] = ''
      }
    }

    return value
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

export default { parseHTML, getNodeValue }

import objectHash from '@dooksa/object-hash'

/**
 * Convert html to dooksa display data
 * @param {Object} source - Template node
 * @param {Object} contentTypes - List of element keys that will be used as content
 * @returns {Object}
 */
const parseHTML = (
  source,
  contentTypes = {},
  ignoreAttributes = {},
  data = {
    mode: '',
    lang: '',
    id: '',
    component: {},
    content: [],
    contentRefs: {},
    sectionRefs: {},
    layout: [],
    layoutId: [],
    layoutEntry: [],
    widgetEvent: [],
    section: [],
    widgetSection: [],
    layoutIndex: 0
  },
  head = true
) => {
  let nodeLists = [source]

  if (head) {
    // set metadata
    data.mode = source.getAttribute('ds-mode') || 'default'
    data.lang = source.getAttribute('ds-lang') || 'en'
    data.id = source.getAttribute('ds-template-id')

    if (source.tagName === 'TEMPLATE') {
      // clone template content
      const fragment = source.content.cloneNode(true)

      // set child nodes
      nodeLists = [fragment.childNodes]
    }
  }

  const content = []
  const contentRefs = {}
  const layoutNodes = []
  const layout = []
  const layoutEntry = []
  const widgetEvent = {}
  const widgetSection = []
  let sectionIndex = 0

  data.content[data.layoutIndex] = content
  data.layout[data.layoutIndex] = layout
  data.layoutEntry[data.layoutIndex] = layoutEntry
  data.widgetEvent[data.layoutIndex] = widgetEvent
  data.widgetSection[data.layoutIndex] = widgetSection

  for (let i = 0; i < nodeLists.length; i++) {
    const nodeList = nodeLists[i]

    for (let j = 0; j < nodeList.length; j++) {
      const node = nodeList[j]
      const isTextNode = node.nodeName === '#text' && node.textContent.trim()

      // remove empty text nodes
      if (!isTextNode && !node.tagName) {
        node.remove()
        --j
        continue
      }

      const item = {}
      const component = {}

      layout.push(item)

      if (node.parentElement) {
        const parentIndex = layoutNodes.indexOf(node.parentElement)

        if (parentIndex !== -1) {
          item.parentIndex = parentIndex
        }
      } else {
        layoutEntry.push(data.layoutIndex)
      }

      if (isTextNode) {
        item.contentIndex = content.length
        component.id = 'text'
        content.push(node)
        layoutNodes.push(node)
      } else if (node.nodeName === 'DS-TEXT') {
        const textNode = {
          nodeName: '#text',
          text: node.innerHTML
        }

        Object.defineProperty(textNode, 'textContent', {
          get () {
            return this.text
          }
        })

        item.contentIndex = content.length
        component.id = 'text'
        content.push(textNode)
        layoutNodes.push(textNode)

        if (node.attributes.length) {
          const result = parseAttributes(node.attributes, ignoreAttributes[component.id])

          if (result.bind.on) {
            widgetEvent[j] = result.bind.on
          }

          const contentRef = result.options['ds-content-ref']

          if (contentRef) {
            contentRefs[item.contentIndex] = contentRef

            if (!data.contentRefs[data.layoutIndex]) {
              data.contentRefs[data.layoutIndex] = contentRefs
            }
          }
        }

        // remove childNodes
        if (node.childNodes.length) {
          for (let i = 0; i < node.childNodes.length; i++) {
            node.childNodes[i].remove()
          }
        }
      } else {
        const element = {
          isSection: false
        }

        layoutNodes.push(node)

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
            widgetEvent[j] = result.bind.on
          }

          const contentRef = result.options['ds-content-ref']

          if (contentRef) {
            contentRefs[item.contentIndex] = contentRef

            if (!data.contentRefs[data.layoutIndex]) {
              data.contentRefs[data.layoutIndex] = contentRefs
            }
          }

          const sectionRef = result.options['ds-section-ref']

          if (sectionRef) {
            element.sectionRef = sectionRef
          }

          element.isSection = result.bind.hasSection

          if (result.attributes.length) {
            component.attributes = result.attributes
          }
        }

        // add section
        const sections = []

        if (element.isSection) {
          data.section.push(sections)
          item.sectionIndex = sectionIndex

          if (element.sectionRef) {
            data.sectionRefs[data.section.length - 1] = element.sectionRef
          }
        }

        // prepare child nodes
        if (node.childNodes.length) {
          if (element.isSection) {
            widgetSection.push(data.section.length - 1)

            // collect instances inside a section
            for (let i = 0; i < node.childNodes.length; i++) {
              const childNode = node.childNodes[i]

              if (!childNode.nodeName === '#text' || childNode.textContent.trim()) {
                // increase the data index to exclude the children from the current section
                ++data.layoutIndex

                sections.push(data.layoutIndex)
                // create new instance
                parseHTML([childNode], contentTypes, ignoreAttributes, data, false)
              }
            }

            ++sectionIndex
          } else {
            nodeLists.push(node.childNodes)
          }
        }
      }

      const componentId = objectHash(component)

      item.componentId = componentId
      data.component[componentId] = component
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
    options: {},
    attributes: [],
    bind: {}
  }

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    const name = attribute.name
    const value = attribute.value

    if (!ignore.includes(name)) {
      if (name.substring(0, 3) === 'ds-') {
        const bind = name.split('-')

        if (bind[1] === 'on') {
          item.bind.on = {
            name: bind.slice(2).join('-'),
            value: value.split(' ')
          }
        } else if (bind[1] === 'section' && !bind[2]) {
          item.bind.hasSection = true
        } else {
          item.options[name] = value
        }
      } else {
        const valueSorted = value.split(' ').sort().join(' ')

        item.attributes.push([name, valueSorted])
      }
    }
  }

  return item
}

export default parseHTML

import createPlugin from '@dooksa/create-plugin'
import { dataUnsafeSetData, dataGenerateId, $getDataValue } from './data.js'

/**
 * @typedef {import('@dooksa/create-component').Component} Component
 * @typedef {import('@dooksa/create-component').ComponentInstance} ComponentInstance
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} id - Component item id
 * @property {ComponentInstance} component
 * @property {Component} template
 * @property {Object} [content]
 * @property {ComponentItem[]} [children]
 */

/**
 * @param {string} name
 * @returns {Component}
 */
let _$component = (name) => ({ id: '' })

/**
 * Get component data
 * @param {string} id - Component data id
 * @param {ComponentItem[]} [result]
 * @param {ComponentItem} [parentItem]
 * @param {Node} [parentNode]
 * @returns {ComponentItem[]}
 */
function getValues (id, result = [], parentItem, parentNode) {
  const node = $getDataValue('component/nodes', { id })

  if (!node.isEmpty) {
    // children already attached
    if (parentNode && node.item.parentElement === parentNode) {
      return
    }

    // detach from previous node
    node.remove()
  }

  const component = $getDataValue('component/items', { id }).item
  const content = $getDataValue('component/content', { id })
  const children = $getDataValue('component/children', { id })
  const template = _$component(component.id)
  const item = { id, component, template }

  // check if current component is out of date
  // if (component.hash !== template.hash) {
  //   updateComponent(component, template)
  // }

  // add child component to parent
  if (parentItem) {
    parentItem.children.push(item)
  }

  // add content
  if (!content.isEmpty) {
    item.content = content.item
  }

  if (!children.isEmpty) {
    item.children = []

    for (let i = 0; i < children.length; i++) {
      const id = children[i]

      getValues(id, result, item, node.item)
    }
  }

  result.push(item)

  return result
}



function getContent (node, content) {
  const result = {}

  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.get) {
      result[item.name] = node[item.get]
    }
  }

  return result
}

function setContent (node, content, values) {
  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.set) {
      node[item.set] = values[item.name]
    }
  }
}

/**
 *
 * @param {Component} template
 * @param {ComponentInstance} component
 * @param {Object} [content]
 * @param {ComponentItem[]} [children]
 * @returns {Promise<Node>}
 */
function lazyLoad (template, component, content, children) {
  return new Promise((resolve, reject) => {
    template.component()
      .then(() => {
        template.isLoaded = true

        const element = createNode(template, component, content, children)

        resolve(element)
      })
      .catch(error => reject(error))
  })
}

/**
 *
 * @param {Component} template
 * @param {ComponentInstance} component
 * @param {Object} [content]
 * @param {ComponentItem[]} [children]
 * @returns {Node|Promise<Node>}
 */
function createNode (template, component, content, children) {
  if (!template.isLoaded) {
    return lazyLoad(template, component, children)
  }

  let node

  // Custom element constructor
  if (typeof template.initialize === 'function') {
    node = template.initialize()
  } else {
    // create element
    node = document.createElement(template.tag)
  }

  const properties = component.properties || template.properties

  if (properties) {
    setProperties(node, properties)
  }

  if (content) {
    setContent(node, template.content, content)
  }

  if (children) {
    appendChildren(node, children)
  }

  return node
}

/**
 * Get template child instances
 * @param {string} id
 * @param {ComponentItem[]} [result=[]]
 * @returns {ComponentItem[]}
 */
function templateChildrenInstances (id, result = []) {
  const template = _$component(id)

  for (let i = 0; i < template.children.length; i++) {
    const child = template.children[i]
    let id = child

    if (typeof child === 'object') {
      id = child.id
    }

    const component = _$component(id)
    const item = {
      component: {
        id,
        properties: component.properties
      },
      template: component

    }

    if (component.children) {
      item.component.children = component.children.map(item => {
        let id = item

        if (typeof item === 'object') {
          id = item.id
        }

        childrenInstances(id, result)
      })
    }

    result.push(item)
  }

  return result
}

/**
 * Get template child instances
 * @param {string} id
 * @returns {ComponentItem[]}
 */
function childrenInstances (id) {
  const children = $getDataValue('component/children', {
    id,
    options: {
      expand: true
    }
  })
  const result = []

  if (!children.isExpandEmpty) {

    for (let i = 0; i < children.expand.length; i++) {
      const data = children.expand[i]
      const template = _$component(data.item.id)
      const instance = {
        id: data.id,
        template,
        component: data.item
      }

      // collect content
      if (template.content) {
        const componentContent = $getDataValue('component/content', {
          id: data.id
        })

        if (!componentContent.isEmpty) {
          instance.content = $getDataValue('content/items', {
            id: componentContent.item
          }).item
        }
      }

      result.push(instance)
    }
  }

  return result
}

/**
 *
 * @param {HTMLElement} element
 * @param {ComponentItem[]} children
 */
function appendChildren (element, children = []) {
  const nodeList = []
  let hasPromise = false

  for (let i = 0; i < children.length; i++) {
    const item = children[i]

    // check if is section
    if (item.template.children) {
      item.children = childrenInstances(item.id)
    }

    const childNode = createNode(item.template, item.component, item.content, item.children)

    if (childNode instanceof Promise) {
      hasPromise = true
    }

    nodeList.push(childNode)
  }

  if (hasPromise) {
    return Promise.all(nodeList)
      .then((nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]

          element.appendChild(node)
        }
      })
  }

  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i]

    // @ts-ignore
    element.appendChild(node)
  }
}

/**
 * Set properties to element
 * @param {HTMLElement} element - view node id
 * @param {Object[]} properties
 * @private
 */
function setProperties (element, properties = []) {
  for (let i = 0; i < properties.length; i++) {
    const { name, value } = properties[i]

    if (element[name] != null) {
      element[name] = value
    } else {
      element.setAttribute(name, value)
    }
  }
}

const component = createPlugin({
  name: 'component',
  models: {
    nodes: {
      type: 'collection',
      items: {
        type: 'object'
      }
    },
    items: {
      type: 'collection',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                join: { type: 'boolean' },
                value: { type: 'string' }
              }
            }
          }
        }
      }
    },
    children: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'component/items'
        }
      }
    },
    content: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'content/items'
      }
    }
  },
  actions: {
    /**
     * @param {Object} param
     * @param {string} param.nodeId - Node id
     * @param {string} param.id - Component Id
     */
    appendChildren ({ nodeId, id }) {
      const node = $getDataValue('component/nodes', { id: nodeId })

      if (node.isEmpty) {
        throw new Error('No node found by the id: ' + id)
      }

      const children = getValues(id)

      appendChildren(node.item, children)
    },
    /**
     * Set component
     * @param {Object} param
     * @param {Component} param.item
     * @param {string} [param.id]
     * @returns {string}
     */
    set ({ item, id = dataGenerateId() }) {
      const result = dataUnsafeSetData('component/items', item, { id })

      return result.id
    }
  },
  setup ({ rootId = 'root', $component }) {
    const rootEl = document.getElementById(rootId)

    if (!rootEl) {
      throw Error('No root element found: #' + rootId)
    }

    const template = $component('root')
    const component = $getDataValue('component/items', { id: 'root' }).item || template
    const element = createNode(template, component)

    /**
     * This is an element
     * @TODO Add "@overload" to createNode
     */
    // @ts-ignore
    rootEl.replaceWith(element)

    _$component = $component

    /**
     * @TODO unsafe is needed because nodes are not yet supported
     */
    dataUnsafeSetData('component/nodes', element, { id: 'root' })
  }
})

const componentAppendChildren = component.actions.appendChildren

export {
  componentAppendChildren
}

export default component



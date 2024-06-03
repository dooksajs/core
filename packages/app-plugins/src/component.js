import createPlugin from '@dooksa/create-plugin'
import { dataUnsafeSetData, dataGenerateId, $getDataValue, $addDataListener, $setDataValue } from './data.js'
import { $emit } from './event.js'

/**
 * @typedef {import('@dooksa/create-component').Component} Component
 * @typedef {import('@dooksa/create-component').ComponentEvent} ComponentEvent
 * @typedef {import('@dooksa/create-component').ComponentInstance} ComponentInstance
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} id - Component item id
 * @property {ComponentInstance} component
 * @property {Component} template
 * @property {Object} [content]
 * @property {ComponentEvent[]} [events]
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
    node.item.remove()
  }

  let component = $getDataValue('component/items', { id })
  let templateId
  let isTemplate
  const instance = {
    id,
    component: component.item
  }

  if (!component.isEmpty) {
    templateId = component.item.id
    isTemplate = component.item.isTemplate
  } else {
    templateId = id
    isTemplate = true
  }

  const template = _$component(templateId)

  if (!template) {
    throw new Error('Component not found: ' + templateId)
  }

  // assign instance template
  instance.template = template

  if (isTemplate) {
    // create template
    const item = templateInstance(id, template)

    // update instance component
    instance.component = item.component
    instance.id = id
  }


  const content = $getDataValue('component/content', { id })
  const children = $getDataValue('component/children', { id })
  const events = $getDataValue('component/events', { id })

  // check if current component is out of date
  // if (component.hash !== template.hash) {
  //   updateComponent(component, template)
  // }

  // add child component to parent
  if (parentItem) {
    parentItem.children.push(instance)
  }

  // add content
  if (!content.isEmpty) {
    instance.content = content.item
  }

  if (!events.isEmpty) {
    instance.events = events.item
  }

  if (!children.isEmpty) {
    instance.children = []

    for (let i = 0; i < children.length; i++) {
      const id = children[i]

      getValues(id, result, instance, node.item)
    }
  }

  result.push(instance)

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
 * @param {string} id - Component instance Id
 * @param {Component} template
 * @param {ComponentInstance} component
 * @param {Object} [content]
 * @param {ComponentEvent[]} [events]
 * @param {ComponentItem[]} [children]
 * @returns {Promise<Node>}
 */
function lazyLoad (id, template, component, content, events, children) {
  return new Promise((resolve, reject) => {
    template.component()
      .then(() => {
        template.isLoaded = true

        const element = createNode(id, template, component, content, events, children)

        resolve(element)
      })
      .catch(error => reject(error))
  })
}

/**
 *
 * @param {string} id - Component instance Id
 * @param {Component} template
 * @param {ComponentInstance} component
 * @param {Object} [content]
 * @param {ComponentEvent[]} [events]
 * @param {ComponentItem[]} [children]
 * @returns {Node|Promise<Node>}
 */
function createNode (id, template, component, content, events, children) {
  if (!template.isLoaded) {
    return lazyLoad(id, template, component, children)
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

  if (events) {
    const eventType = template.eventTypes
    const hasEvent = {}

    for (let i = 0; i < events.length; i++) {
      const on = events[i].on

      if (eventType[on] && !hasEvent[on]) {
        hasEvent[on] = true

        node.addEventListener(on, () => {
          $emit('component/' + on, {
            id,
            context: {
              componentId: id
            }
          })
        })
      }
    }
  }

  if (children) {
    appendChildren(node, children)
  }

  if (template.allowedChildren) {
    $emit('component/attach', {
      id,
      context: {
        componentId: id,
        children
      }
    })

    $addDataListener('component/children', {
      on: 'update',
      id: id,
      handler: ({ item }) => {
        appendChildren(node, item)
      }
    })
  }

  return node
}

function templateInstance (id, template) {
  const component = { id: template.id, hash: template.hash }
  const instance = { id, component, template }

  if (template.properties) {
    component.properties = template.properties
  }

  if (template.children) {
    templateChildrenInstances(id, template)
  }

  if (template.events) {
    for (let i = 0; i < template.events.length; i++) {
      const event = template.events[i]
      const eventData = $setDataValue('event/listeners', event.actionId, {
        id,
        suffixId: 'component/' + event.on,
        update: {
          method: 'push'
        }
      })

      $setDataValue('component/events', {
        id: eventData.id,
        on: event.on,
        actionId: event.actionId
      }, {
        id,
        update: {
          method: 'push'
        }
      })
    }
  }

  $setDataValue('component/items', component, { id })

  return instance
}

/**
 * Get template child instances
 * @param {string} id
 * @param {Component} template
 * @returns {ComponentItem[]}
 */
function templateChildrenInstances (id, template) {
  const result = []
  const children = []
  const templateChildren = template.children

  for (let i = 0; i < templateChildren.length; i++) {
    let template = templateChildren[i]

    if (typeof template === 'string') {
      template = _$component(template)
    }

    const id = dataGenerateId()
    const instance = templateInstance(id, template)

    children.push(id)
    result.push(instance)
  }

  $setDataValue('component/children', children, { id })

  return result
}

/**
 * Get template child instances
 * @param {Object} children
 * @returns {ComponentItem[]}
 */
function childrenInstances (children) {
  const result = []

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
    const itemChildren = $getDataValue('component/children', {
      id: item.id,
      options: {
        expand: true
      }
    })

    // collect children
    if (!itemChildren.isEmpty) {
      item.children = childrenInstances(itemChildren)
    }

    const childNode = createNode(item.id, item.template, item.component, item.content, item.events, item.children)

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
    events: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              relation: 'event/listeners'
            },
            on: { type: 'string' },
            actionId: {
              type: 'string',
              relation: 'action/item'
            }
          }

        }
      }
    },
    items: {
      type: 'collection',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          isTemplate: { type: 'boolean' },
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
    parent: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'component/items'
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
    append ({ nodeId, id }) {
      const node = $getDataValue('component/nodes', { id: nodeId })

      if (node.isEmpty) {
        throw new Error('No node found by the id: ' + id)
      }

      const children = getValues(id)

      appendChildren(node.item, children)

      $setDataValue('component/parent', nodeId, { id })
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

    const id = 'root'
    const template = $component('root')
    const component = $getDataValue('component/items', { id }).item || template
    const element = createNode(id, template, component)

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

const componentAppend = component.actions.append

export {
  componentAppend
}

export default component



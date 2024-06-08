import createPlugin from '@dooksa/create-plugin'
import {
  dataUnsafeSetData,
  dataGenerateId,
  $getDataValue,
  $addDataListener,
  $setDataValue
} from './data.js'
import { $emit } from './event.js'

/**
 * @typedef {import('@dooksa/create-component').Component} Component
 * @typedef {import('@dooksa/create-component').ComponentEvent} ComponentEvent
 * @typedef {import('@dooksa/create-component').ComponentInstance} ComponentInstance
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} id - Component item id
 * @property {string} parentId - Parent component item id
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
let _$component = (name) => ({
  id: ''
})

/**
 * Get component data
 * @param {string} id - Component data id
 * @param {ComponentItem[]} [result]
 * @param {ComponentItem} [parentItem]
 * @param {Node} [parentNode]
 * @returns {ComponentItem[]}
 */
function getValues (id, parentId, result = [], parentItem, parentNode) {
  const node = $getDataValue('component/nodes', {
    id
  })

  if (!node.isEmpty) {
    // children already attached
    if (parentNode && node.item.parentElement === parentNode) {
      return
    }

    // detach from previous node
    node.item.remove()
  }

  let component = $getDataValue('component/items', {
    id
  })
  let templateId
  let isTemplate


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

  const instance = {
    id,
    parentId,
    component: component.item,
    template: template
  }

  if (isTemplate) {
    // create template
    const item = templateInstance(id, parentId, template)

    // update instance component
    instance.component = item.component
  }


  const content = $getDataValue('component/content', {
    id
  })
  const children = $getDataValue('component/children', {
    id
  })
  const events = $getDataValue('component/events', {
    id
  })

  // check if current component is out of date
  // if (component.hash !== template.hash) {
  //   updateComponent(component, template)
  // }

  // add child component to parent


  // add content
  if (!content.isEmpty) {
    instance.content = content.item
  }

  if (!events.isEmpty) {
    instance.events = events.item
  }

  if (!children.isEmpty) {
    instance.children = []

    for (let i = 0; i < children.item.length; i++) {
      const id = children.item[i]

      getValues(id, parentId, result, instance, node.item)
    }
  }

  if (parentItem) {
    parentItem.children.push(instance)
  } else {
    result.push(instance)
  }

  return result
}



function getContent (node, content) {
  const result = {}

  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.propertyName) {
      result[item.propertyName] = node[item.get]
    }
  }

  return result
}

function setContent (node, content, values) {
  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.propertyName) {
      node[item.propertyName] = values[item.name]
    }
  }
}

/**
 * @param {Object} item
 * @param {string} item.parentId - Parent component instance Id
 * @param {string} item.id - Component instance Id
 * @param {Component} item.template
 * @param {ComponentInstance} item.component
 * @param {Object} [item.content]
 * @param {ComponentEvent[]} [item.events]
 * @param {ComponentItem[]} [item.children]
 * @returns {Promise<Node>}
 */
function lazyLoad (item) {
  const template = item.template

  return new Promise((resolve, reject) => {
    template.component()
      .then(() => {
        template.isLoaded = true

        const element = createNode(item)

        resolve(element)
      })
      .catch(error => reject(error))
  })
}

/**
 * @param {Object} item
 * @param {string} item.parentId - Parent component instance Id
 * @param {string} item.id - Component instance Id
 * @param {Component} item.template
 * @param {ComponentInstance} item.component
 * @param {Object} [item.content]
 * @param {ComponentEvent[]} [item.events]
 * @param {ComponentItem[]} [item.children]
 * @returns {Node|Promise<Node>}
 */
function createNode (item) {
  const id = item.id
  const parentId = item.parentId
  const component = item.component
  let template = item.template
  let currentTemplate = template

  if (template.parentId) {
    template = _$component(template.parentId)
  }

  if (!template.isLoaded) {
    return lazyLoad(item)
  }

  let node

  // Custom element constructor
  if (typeof template.initialize === 'function') {
    node = template.initialize()
  } else {
    // create element
    node = document.createElement(template.tag)
  }

  const properties = component.properties || currentTemplate.properties

  if (properties) {
    setProperties(node, properties)
  }

  if (item.content) {
    setContent(node, template.content, item.content)
  }

  if (item.events) {
    const eventType = template.eventTypes
    const hasEvent = {}

    for (let i = 0; i < item.events.length; i++) {
      const on = item.events[i].on

      if (eventType[on] && !hasEvent[on]) {
        hasEvent[on] = true

        node.addEventListener(on, () => {
          $emit('component/' + on, {
            id,
            context: {
              id,
              parentId
            }
          })
        })
      }
    }
  }

  if (item.children) {
    appendChildren(node, item.children)
  }

  if (template.allowedChildren) {
    $emit('component/attach', {
      id,
      context: {
        id,
        children: item.children,
        parentId
      }
    })

    $addDataListener('component/children', {
      on: 'update',
      id,
      handler: ({ item }) => {
        const children = getValues(id, parentId)

        appendChildren(node, children)
      }
    })
  }

  dataUnsafeSetData('component/nodes', node, {
    id
  })

  return node
}

function templateInstance (id, parentId, template) {
  const component = {
    id: template.id,
    hash: template.hash
  }
  const instance = {
    id,
    parentId,
    component,
    template
  }

  if (template.properties) {
    component.properties = template.properties
  }

  if (template.children) {
    templateChildrenInstances(id, parentId, template)
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

  $setDataValue('component/items', component, {
    id
  })
  $setDataValue('component/parent', parentId, {
    id
  })

  // render component on data change
  $addDataListener('component/items', {
    on: 'update',
    id: id,
    handler: () => {
      const nodeData = $getDataValue('component/node', {
        id
      })
      const children = getValues(id, parentId)

      appendChildren(nodeData.item, children)
    }
  })

  return instance
}

/**
 * Get template child instances
 * @param {string} id
 * @param {Component} template
 * @returns {ComponentItem[]}
 */
function templateChildrenInstances (id, parentId, template) {
  const result = []
  const children = []
  const templateChildren = template.children

  for (let i = 0; i < templateChildren.length; i++) {
    let template = templateChildren[i]

    if (typeof template === 'string') {
      template = _$component(template)
    }

    const id = dataGenerateId()
    const instance = templateInstance(id, parentId, template)

    children.push(id)
    result.push(instance)
  }

  $setDataValue('component/children', children, {
    id
  })

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
    const { id, item } = children.expand[i]
    const template = _$component(item.id)
    const parentId = $getDataValue('component/parent', {
      id
    }).item
    const instance = {
      id,
      template,
      parentId,
      component: item
    }

    // collect content
    if (template.content) {
      const componentContent = $getDataValue('component/content', {
        id
      })

      if (!componentContent.isEmpty) {
        instance.content = $getDataValue('content/items', {
          id: componentContent.item
        }).item
      }
    }

    const eventData = $getDataValue('component/events', {
      id
    })

    // collect events
    if (!eventData.isEmpty) {
      instance.events = eventData.item
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

    const childNode = createNode(item)

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
            on: {
              type: 'string'
            },
            actionId: {
              type: 'string',
              relation: 'action/items'
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
          id: {
            type: 'string'
          },
          isTemplate: {
            type: 'boolean'
          },
          properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                join: {
                  type: 'boolean'
                },
                value: {
                  type: 'string'
                }
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
      const node = $getDataValue('component/nodes', {
        id: nodeId
      })

      if (node.isEmpty) {
        throw new Error('No node found by the id: ' + id)
      }

      const children = getValues(id, id)

      appendChildren(node.item, children)

      $setDataValue('component/parent', nodeId, {
        id
      })
    },
    render ({ id }) {
      const node = $getDataValue('component/nodes', {
        id
      })
      const childrenData = $getDataValue('component/children', {
        id
      })
      const children = []

      if (!childrenData.isEmpty) {
        for (let i = 0; i < childrenData.item.length; i++) {
          getValues(childrenData.item[i], id, children, null, node.item)
        }
      }

      appendChildren(node.item, children)
    }
  },
  setup ({ rootId = 'root', $component }) {
    const rootEl = document.getElementById(rootId)

    if (!rootEl) {
      throw Error('No root element found: #' + rootId)
    }

    dataUnsafeSetData('component/nodes', document.body, {
      id: 'body'
    })

    const id = 'root'
    const template = $component('div')
    const component = $getDataValue('component/items', {
      id
    }).item || template
    const element = createNode({
      id,
      parentId: 'body',
      template,
      component
    })

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
    dataUnsafeSetData('component/nodes', element, {
      id: 'root'
    })
  }
})

const componentAppend = component.actions.append

export {
  componentAppend
}

export default component



import createPlugin from '@dooksa/create-plugin'
import {
  dataUnsafeSetData,
  dataGenerateId,
  $getDataValue,
  $addDataListener,
  $setDataValue,
  $deleteDataValue
} from './data.js'
import { $emit } from './event.js'

/**
 * @typedef {import('@dooksa/create-component').Component} Component
 * @typedef {import('@dooksa/create-component').ComponentEvent} ComponentEvent
 * @typedef {import('@dooksa/create-component').ComponentInstance} ComponentInstance
 */

/**
 * @typedef {Object} ComponentItem
 * @property {string} [id] - Component item id
 * @property {string} [rootId] - Root component item id
 * @property {string} [parentId] - Parent component item id
 * @property {string} [groupId] - Component group id
 * @property {ComponentInstance} [component]
 * @property {Component} [template]
 * @property {Node} [node] - Component node
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
 * @param {string} rootId - Component root id
 * @param {string} parentId - Component data id
 * @param {string} groupId - Component group id
 * @param {ComponentItem} [parentItem]
 * @param {Node} [parentNode]
 * @returns {ComponentItem}
 */
function getValues (id, rootId, parentId, groupId, parentItem, parentNode) {
  const node = $getDataValue('component/nodes', { id })
  const children = $getDataValue('component/children', { id })
  const instance = {
    id,
    rootId,
    parentId,
    groupId
  }

  if (!children.isEmpty) {
    instance.children = []

    for (let i = 0; i < children.item.length; i++) {
      const id = children.item[i]

      rootId = $getDataValue('component/roots', id).item || rootId
      groupId = $getDataValue('component/groups', id).item || groupId

      getValues(id, rootId, parentId, groupId, instance, node.item)
    }
  }

  if (parentItem) {
    instance.parentId = parentItem.id
    parentItem.children.push(instance)
  }

  if (!node.isEmpty) {
    // children already attached
    if (parentNode && node.item.parentElement === parentNode) {
      return
    }

    // detach from previous node
    node.item.remove()

    instance.node = node.item

    return instance
  }

  let component = $getDataValue('component/items', { id })
  let templateId
  let isTemplate

  if (!component.isEmpty) {
    const data = component.item

    templateId = data.id
    isTemplate = data.isTemplate
    groupId = data.groupId || groupId
  } else {
    templateId = id
    isTemplate = true
  }

  const template = _$component(templateId)

  if (!template) {
    throw new Error('Component not found: ' + templateId)
  }

  instance.template = template
  instance.component = component.item

  if (isTemplate) {
    // set component group
    $setDataValue('component/groups', groupId, { id })
    // create template
    const item = templateInstance(id, rootId, parentId, groupId, template)
    // update instance component
    instance.component = item.component
  }

  const content = $getDataValue('component/content', { id })
  const events = $getDataValue('component/events', { id })

  // check if current component is out of date
  // if (component.hash !== template.hash) {
  //   updateComponent(component, template)
  // }

  // add child component to parent


  // add content
  if (!content.isEmpty) {
    instance.content = $getDataValue('content/items', { id: content.item })
  }

  if (!events.isEmpty) {
    instance.events = events.item
  }

  return instance
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
 * @param {ComponentItem} item
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
 * @param {ComponentItem} item
 * @returns {Node|Promise<Node>}
 */
function createNode (item) {
  const id = item.id
  const rootId = item.rootId
  const parentId = item.parentId
  const groupId = item.groupId
  const component = item.component
  let template = item.template
  let currentTemplate = template
  let contentId

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
    contentId = item.content.id

    // render children on update
    $addDataListener('content/items', {
      on: 'update',
      id: contentId,
      handler: (data) => {
        setContent(node, template.content, data.item)
      }
    })
  }

  if (item.events) {
    const events = item.events
    const eventTypes = template.eventTypes || {}
    const hasEvent = {}

    for (let i = 0; i < events.length; i++) {
      const on = events[i].on

      if (eventTypes[on] && !hasEvent[on]) {
        hasEvent[on] = true
        const handler = () => {
          // fire node events
          $emit('component/' + on, {
            id,
            context: {
              id,
              rootId,
              parentId,
              groupId
            }
          })
        }

        node.addEventListener(on, handler)

        // store handler
        dataUnsafeSetData('event/handlers', handler, { id })
        // handle removal
        $addDataListener('event/handlers', {
          on: 'delete',
          id,
          handler () {
            node.removeEventListener(on, handler)
          }
        })
      } else if (on === 'created') {
        // fire mount event
        $emit('component/created', {
          id,
          context: {
            id,
            rootId,
            contentId,
            parentId,
            groupId
          }
        })
      }
    }
  }

  // if (item.children) {
  //   appendChildren(node, item.children)

  //   // render children on update
  //   $addDataListener('component/children', {
  //     on: 'update',
  //     id,
  //     handler (data) {
  //       const children = getValues(id, rootId, parentId, groupId, [], item, node)

  //       appendChildren(node, children)
  //     }
  //   })
  // }

  dataUnsafeSetData('component/nodes', node, { id })

  return node
}

function templateInstance (id, rootId, parentId, groupId, template) {
  const properties = {}
  const component = {
    id: template.id,
    hash: template.hash
  }
  const instance = {
    id,
    rootId,
    parentId,
    groupId,
    component,
    template
  }

  if (template.properties) {
    component.properties = template.properties


    for (let i = 0; i < template.properties.length; i++) {
      const { name, value } = template.properties[i]

      properties[name] = value
    }
  }

  if (template.children) {
    templateChildrenInstances(id, rootId, parentId, groupId, template)
  }

  let parentTemplate = template

  if (template.parentId) {
    parentTemplate = _$component(template.parentId)
  }

  if (parentTemplate.content) {
    const content = {}

    for (let i = 0; i < parentTemplate.content.length; i++) {
      const data = parentTemplate.content[i]

      content[data.name] = properties[data.propertyName] || ''
    }

    const contentData = $setDataValue('content/items', content)

    $setDataValue('component/content', contentData.id, { id })
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
  $setDataValue('component/roots', rootId, { id })
  $setDataValue('component/groups', groupId, { id })
  $setDataValue('component/parents', parentId, { id })

  // render component on data change
  $addDataListener('component/items', {
    on: 'update',
    id,
    handler: () => {
      componentRender({ id })
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
function templateChildrenInstances (id, rootId, parentId, groupId, template) {
  const result = []
  const children = []
  const templateChildren = template.children

  parentId = id

  for (let i = 0; i < templateChildren.length; i++) {
    let template = templateChildren[i]

    if (typeof template === 'string') {
      template = _$component(template)
    }

    const id = dataGenerateId()
    const instance = templateInstance(id, rootId, parentId, groupId, template)

    children.push(id)
    result.push(instance)
  }

  $setDataValue('component/children', children, { id, stopPropagation: true })

  return result
}

/**
 * Get template child instances
 * @param {Object} children
 * @returns {ComponentItem[]}
 */
function childrenInstances (children) {
  const result = []

  for (let i = 0; i < children.length; i++) {
    const id = { id: children[i] }
    const node = $getDataValue('component/nodes', id)

    if (!node.isEmpty) {
      result.push({
        node: node.item
      })

      continue
    }

    const item = $getDataValue('component/items', id).item
    const template = _$component(item.id)
    const parentId = $getDataValue('component/parents', id).item
    const groupId = $getDataValue('component/groups', id).item
    const rootId = $getDataValue('component/roots', id).item
    const instance = {
      id: children[i],
      rootId,
      parentId,
      groupId,
      template,
      component: item
    }

    let parentTemplate = template

    if (template.parentId) {
      parentTemplate = _$component(template.parentId)
    }

    // collect content
    if (parentTemplate.content) {
      const componentContent = $getDataValue('component/content', id)

      if (!componentContent.isEmpty) {
        instance.content = $getDataValue('content/items', {
          id: componentContent.item
        })
      }
    }

    const eventData = $getDataValue('component/events', id)

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
  const nextChildren = []
  let hasPromise = false

  for (let i = 0; i < children.length; i++) {
    const item = children[i]

    if (item.node) {
      nodeList.push(item.node)
      continue
    }

    const itemChildren = $getDataValue('component/children', { id: item.id })

    // collect children
    if (!itemChildren.isEmpty) {
      const children = childrenInstances(itemChildren.item)

      nextChildren.push(children)
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
          const children = nextChildren[i]

          element.appendChild(node)

          if (children) {
            appendChildren(node, children)
          }
        }
      })
  }

  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i]
    const children = nextChildren[i]
    // @ts-ignore
    element.appendChild(node)

    if (children) {
      appendChildren(node, children)
    }
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
    parents: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'component/items'
      }
    },
    roots: {
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
    },
    groups: {
      type: 'collection',
      items: {
        type: 'string'
      }
    }
  },
  actions: {
    /**
     * @param {Object} param
     * @param {string} param.id - Component Id
     * @param {string} param.parentId - Parent component Id
     * @param {string} [param.groupId] - Component group Id
     */
    append ({ id, parentId, groupId }) {
      const node = $getDataValue('component/nodes', {
        id: parentId
      })

      if (node.isEmpty) {
        throw new Error('No node found by the id: ' + id)
      }

      $setDataValue('component/children', id, {
        id: parentId,
        update: {
          method: 'update'
        }
      })

      groupId = groupId || id

      const children = getValues(id, id, parentId, groupId)

      appendChildren(node.item, children)

      $setDataValue('component/roots', id, { id })
      $setDataValue('component/parents', parentId, { id })
      $setDataValue('component/groups', groupId, { id })
    },
    render ({ id }) {
      const node = $getDataValue('component/nodes', { id })
      const rootId = $getDataValue('component/roots', { id }).item
      const parentId = $getDataValue('component/parents', { id }).item
      const groupId = $getDataValue('component/groups', { id }).item
      const childrenData = $getDataValue('component/children', { id })
      /**
       * @type {ComponentItem[]}
       */
      const children = []

      if (!childrenData.isEmpty) {
        for (let i = 0; i < childrenData.item.length; i++) {
          const instance = getValues(childrenData.item[i], rootId, parentId, groupId, null, node.item)

          children.push(instance)
        }
      }

      appendChildren(node.item, children)
    },
    remove ({ id }) {
      const parentId = $getDataValue('component/parents', { id }).item
      const parentChildren = $getDataValue('component/children', { id: parentId })

      // remove component from parent
      if (!parentChildren.isEmpty) {
        const children = []

        // filter out current node
        for (let i = 0; i < parentChildren.item.length; i++) {
          const componentId = parentChildren.item[i]

          if (id !== componentId) {
            children.push(componentId)
          }
        }

        if (children.length !== parentChildren.item.length) {
          $setDataValue('component/children', children, {
            id: parentId
          })
        }
      }

      const events = $getDataValue('component/events', { id })

      // remove event handlers
      if (!events.isEmpty) {
        for (let i = 0; i < events.item.length; i++) {
          const event = events.item[i]

          $deleteDataValue('event/handlers', { id: event.id })
        }
      }

      const content = $getDataValue('component/content')

      if(!content.isEmpty) {
        for (let i = 0; i < content.item.length; i++) {
          const contentId = content.item[i]

          $deleteDataValue('content/items', { id: contentId })
        }
      }

      const children = $getDataValue('component/children', { id })

      if (!children.isEmpty) {
        for (let i = 0; i < children.item.length; i++) {
          this.remove({
            id: children.item[i]
          })
        }
      }

      $deleteDataValue('component/groups', { id })
      $deleteDataValue('component/nodes', { id })
      $deleteDataValue('component/parents', { id })
      $deleteDataValue('component/items', { id })
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

    _$component = $component

    $addDataListener('component/children', {
      on: 'update',
      capture: 'all',
      handler (data) {
        const node = $getDataValue('component/nodes', { id: data.id })
        const children = []

        for (let i = 0; i < data.item.length; i++) {
          const id = data.item[i]
          const options = { id }
          const node = $getDataValue('component/nodes', options)

          if (!node.isEmpty) {
            children.push({
              node: node.item
            })

            continue
          }

          const rootId = $getDataValue('component/roots', options).item || id
          const groupId = $getDataValue('component/groups', options).item || id
          const instance = getValues(id, rootId, data.id, groupId)

          children.push(instance)
        }

        appendChildren(node.item, children)
      }
    })

    const id = 'root'
    const template = $component(id)
    const element = createNode({
      id,
      rootId: id,
      parentId: 'body',
      groupId: id,
      events: $getDataValue('component/events').item,
      component: $getDataValue('component/items', { id }).item || template,
      template
    })

    // @ts-ignore
    rootEl.replaceWith(element)
  }
})

const componentAppend = component.actions.append
const componentRender = component.actions.render
const componentRemove = component.actions.remove

export {
  componentAppend,
  componentRender,
  componentRemove
}

export default component



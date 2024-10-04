import createPlugin from '@dooksa/create-plugin'
import {
  dataUnsafeSetValue,
  dataGetValue,
  dataAddListener,
  dataSetValue,
  dataDeleteListener,
  dataDeleteValue
} from './data.js'
import { eventEmit } from './event.js'
import { componentOptions } from '@dooksa/create-component'
import { removeAffix } from './utils/createDataValue.js'
import { generateId } from '@dooksa/utils'

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
let $component = (name) => ({ id: '' })
const attributeObserverCallbacks = {}
let attributeObserver

function getContent (node, content) {
  const result = {}

  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.nodePropertyName) {
      result[item.name] = node[item.nodePropertyName]
    }
  }

  return result
}

function setContent (node, content, values) {
  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.nodePropertyName) {
      node[item.nodePropertyName] = values[item.name]
    }
  }
}

function objectHasSetter (object, property, result = { hasSetter: false }) {
  const descriptor = Object.getOwnPropertyDescriptor(object, property)

  if (descriptor && descriptor.set) {
    result.hasSetter = true

    return
  }

  const prototype = Object.getPrototypeOf(object)

  if (prototype) {
    objectHasSetter(prototype, property, result)
  }

  return result.hasSetter
}

/**
 * Set properties to element
 * @param {HTMLElement} element - view node id
 * @param {Object[]} properties
 * @private
 */
function setProperties (element, properties = []) {
  for (let i = 0; i < properties.length; i++) {
    const {
      name, value
    } = properties[i]

    if (element.hasAttribute && element.hasAttribute(name)) {
      if (element.getAttribute(name) !== value) {
        element.setAttribute(name, value)
      }
    } else if (objectHasSetter(element, name)) {
      // update if new value
      if (element[name] !== value) {
        element[name] = value
      }
    } else {
      element.setAttribute(name, value)
    }
  }
}

/**
 * @typedef {Object} LazyLoad
 * @property {}
 */

/**
 * @template T
 * @param {T} item
 * @param {Object} template
 * @param {function} cb
 * @returns {Promise<T>}
 */
function lazyLoad (item, template, cb) {
  return new Promise((resolve, reject) => {
    template.component()
      .then(() => {
        template.isLoaded = true

        resolve(cb(item))
      })
      .catch(error => reject(error))
  })
}

/**
 * Update content attached to component
 * @param {string} id - component id
 * @param {string} contentId - content id
 * @param {string} contentNoAffixId - content id without language suffix
 * @param {Node} node - Node attached to component
 * @param {Object[]} templateContent - Component content template
 */
function contentListeners (id, contentId, contentNoAffixId, node, templateContent) {
  // update element content if content data changes
  let handlerId = dataAddListener({
    name: 'content/items',
    on: 'update',
    id: contentId,
    handler: (data) => {
      setContent(node, templateContent, data.item)
    }
  })

  dataAddListener({
    name: 'metadata/currentLanguage',
    on: 'update',
    handler: (data) => {
      dataDeleteListener({
        name: 'content/items',
        on: 'update',
        id: contentId,
        handlerId
      })

      // change content lang
      contentId = contentNoAffixId + data.item
      const content = dataGetValue({
        name: 'content/items',
        id
      })

      if (!content.isEmpty) {
        setContent(node, templateContent, content.item)
      }

      handlerId = dataAddListener({
        name: 'content/items',
        on: 'update',
        id: contentId,
        handler: (data) => {
          setContent(node, templateContent, data.item)
        }
      })
    }
  })

  // update element content if component content is changed
  dataAddListener({
    name: 'component/content',
    on: 'update',
    id,
    handler: (data) => {
      const content = dataGetValue({
        name: 'content/items',
        id: data.item
      })

      setContent(node, templateContent, content.item)
    }
  })
}

function createNode (id, item) {
  const template = $component(item.id)
  let node

  if (!template.isLoaded) {
    return lazyLoad({
      id,
      item
    }, template, createNode)
  }

  // Custom element constructor
  if (typeof template.initialize === 'function') {
    node = template.initialize({ id }, eventEmit)
  } else {
    // create element
    node = document.createElement(template.tag)
  }

  node.__dooksaId__ = id
  dataUnsafeSetValue({
    name: 'component/nodes',
    value: node,
    options: { id }
  })

  const properties = dataGetValue({
    name: 'component/properties',
    id
  }).item || template.properties

  if (!properties) {
    setProperties(node, properties)

    dataAddListener({
      name: 'component/properties',
      on: 'update',
      id,
      handler: (options) => {
        setProperties(node, options.item)
      }
    })
  }

  if (template.options) {
    dataAddListener({
      name: 'component/options',
      on: 'update',
      id,
      handler: (options) => {
        const properties = componentOptions(options.item, template.options, template.properties)

        dataSetValue({
          name: 'component/properties',
          value: properties,
          options: { id }
        })
      }
    })
  }

  const content = dataGetValue({
    name: 'component/content',
    id,
    options: { expand: true }
  })
  let contentId
  if (!content.isEmpty) {
    const contentData = content.extend[0]
    const template = $component(item.id)

    contentId = removeAffix(contentData.id)
    setContent(node, template.content, contentData.item)
    contentListeners(id, contentData.id, contentId, node, template.content)
  }

  const children = dataGetValue({
    name: 'component/children',
    id,
    options: { expand: true }
  })
  const rootId = dataGetValue({
    name: 'component/roots',
    id
  }).item
  const groupId = dataGetValue({
    name: 'component/belongsToGroup',
    id
  }).item
  const parentId = dataGetValue({
    name: 'component/parents',
    id
  }).item
  const event = dataGetValue({
    name: 'component/events',
    id
  })

  const context = {
    id,
    rootId,
    parentId,
    groupId,
    contentId
  }
  let hasBeforeCreateEvent = false
  let hasCreatedEvent = false
  let beforeCreateResult

  if (!event.isEmpty) {
    const events = event.item
    const eventTypes = template.eventTypes || {}
    const hasEvent = {}

    // add events
    for (let i = 0; i < events.length; i++) {
      const {
        on, actionId
      } = events[i]
      const eventData = dataSetValue({
        name: 'event/listeners',
        value: actionId,
        options: {
          id: 'component/' + on + id,
          update: { method: 'push' }
        }
      })

      if (on === 'component/created') {
        hasCreatedEvent = true
      } else if (on === 'component/beforeCreate') {
        hasBeforeCreateEvent = true
      }

      dataSetValue({
        name: 'component/events',
        value: eventData.id,
        options: {
          id,
          update: { method: 'pull' }
        }
      })

      if (eventTypes[on] && !hasEvent[on]) {
        const [eventType, eventValue] = on.split('/')

        if (eventType === 'node' || eventType === 'observeProperty' || eventType === 'observeAttribute') {
          hasEvent[on] = true

          nodeEvent(eventType, eventValue, node, on, id, context)
        }
      }
    }

    // fire beforeCreate event
    if (hasBeforeCreateEvent) {
      beforeCreateResult = eventEmit({
        name: 'component/beforeCreate',
        id,
        context
      })
    }
  }

  if (!children.isEmpty) {
    // wait for created events before creating children
    if (hasBeforeCreateEvent) {
      Promise.all(beforeCreateResult)
        .then(() => {
          createChildNodes(
            node,
            children.expand,
            id,
            rootId,
            groupId
          )
        })
    } else {
      createChildNodes(
        node,
        children.children,
        id,
        rootId,
        groupId
      )
    }
  }

  // fire created event
  if (hasCreatedEvent) {
    eventEmit({
      name: 'component/created',
      id,
      context,
      payload: node
    })
  }

  return {
    id,
    item: node
  }
}

/**
 * Observe node prototype property
 * @param {HTMLElement} element
 * @param {string} property - Property name of getter/setter
 * @param {Function} callback
 */
function observeNodeProperty (element, property, callback) {
  const elementPrototype = Object.getPrototypeOf(element)

  if (elementPrototype.hasOwnProperty(property)) {
    const descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property)

    Object.defineProperty(element, property, {
      get: function () {
        return descriptor.get.apply(this, arguments)
      },
      set: function () {
        descriptor.set.apply(this, arguments)
        const newValue = this[property]
        callback(newValue)
        return newValue
      }
    })
  }
}

/**
 * Attribute observer handler
 * @param {Function} callback
 */
function observeNodeAttributeCallback (callback) {
  return function (mutation) {
    const prop = mutation.attributeName

    callback({
      prop,
      oldValue: mutation.oldValue,
      value: mutation.target.getAttribute(prop)
    })
  }
}

/**
 * Observe node attribute
 * @param {string} id
 * @param {HTMLElement} element
 * @param {string} property
 * @param {Function} callback
 */
function observeNodeAttribute (id, element, property, callback) {
  const attributeCallback = observeNodeAttributeCallback(callback)

  // add attribute observer callback
  if (!attributeObserverCallbacks[id]) {
    attributeObserverCallbacks[id] = { [property]: attributeCallback }
  } else {
    attributeObserverCallbacks[id][property] = attributeCallback
  }

  // observe element
  attributeObserver.observe(element, {
    attributes: true,
    attributeOldValue: true
  })
}

function nodeEvent (eventType, eventValue, node, on, id, context) {
  const handler = (payload) => {
    // fire node events
    eventEmit({
      name: on,
      id,
      context,
      payload
    })
  }
  let removeHandler = () => {}

  switch (eventType) {
    case 'node':
      if (eventValue !== 'checked') {
        node.addEventListener(eventValue, handler)
      } else {
        node.addEventListener('input', handler)

        observeNodeProperty(node, eventValue, (value) => {
          handler({
            prop: eventValue,
            value,
            target: { // mimic node event handler
              checked: value
            }
          })
        })
      }

      removeHandler = () => {
        node.removeEventListener(on, handler)
      }
      break
    case 'observeProperty':
      observeNodeProperty(node, eventValue, (value) => {
        handler({
          prop: eventValue,
          value
        })
      })
      break
    case 'observeAttribute':
      observeNodeAttribute(id, node, eventValue, handler)
      removeHandler = () => {
        delete attributeObserverCallbacks[id][eventValue]

        // clear node
        if (!Object.keys(attributeObserverCallbacks[id]).length) {
          delete attributeObserverCallbacks[id]
        }
      }
      break
  }

  // handle removal
  dataAddListener({
    name: 'event/handlers',
    on: 'delete',
    id,
    handler () {
      removeHandler()
    }
  })

  // store handler
  dataUnsafeSetValue({
    name: 'event/handlers',
    value: handler,
    options: { id }
  })
}

/**
 * isTemporary is for components that are not intended to be saved in page state (usually used for dynamic content)
 */

/**
 * Create node from template
 * @param {Object} param
 * @param {string} [param.id],
 * @param {Component} param.template
 * @param {string} param.parentId
 * @param {string} [param.rootId]
 * @param {string} [param.groupId]
 */
function createTemplate ({
  id = generateId(),
  template,
  parentId,
  rootId = id,
  groupId = id
}) {
  const component = {
    id: template.id,
    type: template.type
  }
  const options = { id }
  const properties = {}
  let node
  let contentId

  if (!template.isLoaded) {
    return lazyLoad({
      id,
      template,
      parentId,
      rootId,
      groupId
    }, template, createTemplate)
  }

  // Custom element constructor
  if (typeof template.initialize === 'function') {
    node = template.initialize({
      id,
      template,
      parentId,
      rootId,
      groupId
    }, eventEmit)
  } else {
    // create element
    node = document.createElement(template.tag)
  }

  // store node
  node.__dooksaId__ = id
  dataUnsafeSetValue({
    name: 'component/nodes',
    value: node,
    options
  })

  // set core component values
  dataSetValue({
    name: 'component/roots',
    value: rootId,
    options
  })
  dataSetValue({
    name: 'component/parents',
    value: parentId,
    options
  })
  dataSetValue({
    name: 'component/items',
    value: component,
    options
  })

  // set group
  dataSetValue({
    name: 'component/groups',
    value: id,
    options: {
      id: groupId,
      update: { method: 'push' }
    }
  })
  dataSetValue({
    name: 'component/belongsToGroup',
    value: groupId,
    options
  })

  // set default properties to node
  if (template.properties) {
    for (let i = 0; i < template.properties.length; i++) {
      const {
        name, value
      } = template.properties[i]

      // prepare default content values
      properties[name] = value
    }

    setProperties(node, template.properties)
  }

  // set content
  if (template.content) {
    const content = {}
    const nodeValues = getContent(node, template.content)

    for (let i = 0; i < template.content.length; i++) {
      const data = template.content[i]
      let contentValue = properties[data.nodePropertyName]

      if (contentValue == null) {
        contentValue = nodeValues[data.nodePropertyName]
      }

      // add default value from props
      content[data.name] = contentValue
    }

    const contentData = dataSetValue({
      name: 'content/items',
      value: content
    })
    contentId = removeAffix(contentData.id)

    dataSetValue({
      name: 'content/languages',
      value: contentData.id,
      options: {
        id: contentId,
        update: { method: 'push' }
      }
    })
    dataSetValue({
      name: 'content/components',
      value: id,
      options: {
        id: contentId,
        update: { method: 'push' }
      }
    })
    dataSetValue({
      name: 'component/content',
      value: contentId,
      options
    })

    setContent(node, template.content, content)
    contentListeners(
      id,
      contentData.id,
      removeAffix(contentData.id),
      node,
      template.content
    )
  }

  if (template.options) {
    // Update element attributes
    dataAddListener({
      name: 'component/properties',
      on: 'update',
      id,
      handler: (options) => {
        setProperties(node, options.item)
      }
    })

    // Compile component options
    const handler = (options) => {
      const properties = componentOptions(
        options.item,
        template.options,
        template.properties
      )

      dataSetValue({
        name: 'component/properties',
        value: properties,
        options
      })
    }

    const options = dataGetValue({
      name: 'component/options',
      id
    })

    // update properties if options exist
    if (!options.isEmpty) {
      handler(options)
    }

    // Update component options/properties
    dataAddListener({
      name: 'component/options',
      on: 'update',
      id,
      handler
    })
  }

  const context = {
    id,
    rootId,
    contentId,
    parentId,
    groupId
  }
  let hasCreatedEvent = false
  let hasBeforeCreateEvent = false
  let beforeCreateResult
  // set events
  if (template.events) {
    const events = template.events
    const eventTypes = template.eventTypes || {}
    const hasEvent = {}

    for (let i = 0; i < events.length; i++) {
      const {
        on,
        actionId
      } = events[i]
      const eventData = dataSetValue({
        name: 'event/listeners',
        value: actionId,
        options: {
          id: on + id,
          update: { method: 'push' }
        }
      })

      if (on === 'component/created') {
        hasCreatedEvent = true
      } else if (on === 'component/beforeCreate') {
        hasBeforeCreateEvent = true
      }

      dataSetValue({
        name: 'component/events',
        value: eventData.id,
        options: {
          id,
          update: { method: 'push' }
        }
      })

      if (eventTypes[on] && !hasEvent[on]) {
        const [eventType, eventValue] = on.split('/')

        if (eventType === 'node' || eventType === 'observeProperty' || eventType === 'observeAttribute') {
          hasEvent[on] = true

          nodeEvent(eventType, eventValue, node, on, id, context)
        }
      }
    }

    // fire beforeCreate event
    if (hasBeforeCreateEvent) {
      beforeCreateResult = eventEmit({
        name: 'component/beforeCreate',
        id,
        context,
        payload: node
      })
    }
  }

  if (template.children) {
    // wait for created events before creating children
    if (hasBeforeCreateEvent) {
      Promise.all(beforeCreateResult)
        .then(() => {
          createTemplateChildNodes(
            node,
            template.children,
            id,
            rootId,
            groupId
          )
        })
    } else {
      createTemplateChildNodes(
        node,
        template.children,
        id,
        rootId,
        groupId
      )
    }
  }

  // fire created event
  if (hasCreatedEvent) {
    eventEmit({
      name: 'component/created',
      id,
      context
    })
  }

  return {
    id,
    item: node
  }
}

function createChildNodes (node, components, parentId, parentRootId, parentGroupId) {
  let childIsLazy = false
  let childNodes = []

  for (let i = 0; i < components.length; i++) {
    const {
      id,
      item
    } = components[i]
    let childNode = dataGetValue({
      name: 'component/nodes',
      id
    })

    if (item.isTemplate) {
      let rootId = parentRootId
      let groupId = parentGroupId

      // check if component is a new group
      if (item.groupId) {
        rootId = id
        groupId = item.groupId
      }

      childNode = createTemplate({
        id,
        template: $component(item.id),
        parentId,
        rootId,
        groupId
      })

      if (childNode instanceof Promise) {
        childIsLazy = true
      }
    }

    childNodes.push(childNode)
  }

  if (childIsLazy) {
    Promise.all(childNodes)
      .then(result => {
        for (let i = 0; i < result.length; i++) {
          node.appendChild(result[i].item)
        }
      })
      .catch(error => console.error(error))
  } else {
    for (let i = 0; i < childNodes.length; i++) {
      node.appendChild(childNodes[i].item)
    }
  }
}

function createTemplateChildNodes (node, children, id, rootId, groupId) {
  const childNodes = []
  let childIsLazy = false

  for (let i = 0; i < children.length; i++) {
    const result = createTemplate({
      template: children[i],
      parentId: id,
      rootId,
      groupId
    })

    if (result instanceof Promise) {
      childIsLazy = true
    }

    childNodes.push(result)
  }

  if (childIsLazy) {
    Promise.all(childNodes)
      .then(childNodes => {
        appendChildNodes(id, node, childNodes)
      })
      .catch(error => console.error(error))
  } else {
    appendChildNodes(id, node, childNodes)
  }
}

function appendChildNodes (id, node, childNodes) {
  const value = []

  for (let i = 0; i < childNodes.length; i++) {
    const childNode = childNodes[i]
    // append child node
    node.appendChild(childNode.item)
    // store component id
    value.push(childNode.id)
  }

  // set children component ids to parent
  dataSetValue({
    name: 'component/children',
    value,
    options: {
      id,
      stopPropagation: true
    }
  })
}

function updateChildren (id, parent, nextChildNodes) {
  const prevChildNodes = parent.childNodes
  const removeNodes = {}
  let childLength = nextChildNodes.length

  if (prevChildNodes.length > nextChildNodes.length) {
    childLength = prevChildNodes.length
  }

  for (let i = 0; i < childLength; i++) {
    let nextNode = nextChildNodes[i]
    const prevNode = prevChildNodes[i]

    // exit if we've reached the end of nextNodes
    if (nextNode) {
      nextNode = nextNode.item
    } else {
      break
    }

    // replace previous node
    if (!prevNode) {
      parent.appendChild(nextNode)
    } else if (nextNode !== prevNode) {
      // node was inserted
      const prevComponentId = prevNode.__dooksaId__
      const nextComponentId = nextNode.__dooksaId__
      const prevNodeBelongsTo = dataGetValue({
        name: 'component/parents',
        id: prevComponentId
      })

      // Mark node to be removed does not belong to next list
      if (prevNodeBelongsTo.item === id) {
        let markToRemove = true

        for (let j = i; j < nextChildNodes.length; j++) {
          const node = nextChildNodes[j].item

          if (node === prevNode) {
            markToRemove = false
            break
          }
        }

        if (markToRemove) {
          removeNodes[prevComponentId] = prevNode
        }
      } else if (removeNodes[nextComponentId]) {
        delete removeNodes[nextComponentId]
      }

      // replace prev node with next
      prevNode.replaceWith(nextNode)
    }
  }

  // remove excess unused nodes
  if (prevChildNodes.length > nextChildNodes.length) {
    for (let i = nextChildNodes.length; i < prevChildNodes.length; i++) {
      const node = prevChildNodes[i]
      const componentId = node.__dooksaId__

      if (removeNodes[componentId] === undefined) {
        componentRemove({
          id: componentId,
          stopPropagation: true
        })
        node.remove()
      }
    }
  }

  for (const key in removeNodes) {
    if (Object.hasOwnProperty.call(removeNodes, key)) {
      const node = removeNodes[key]

      componentRemove({
        id: node.__dooksaId__,
        stopPropagation: true
      })
    }
  }
}

const component = createPlugin('component', {
  metadata: {
    title: 'Component',
    description: '',
    icon: 'mdi:widgets'
  },
  models: {
    nodes: {
      type: 'collection',
      items: { type: 'object' }
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
          id: { type: 'string' },
          hash: { type: 'string' },
          isTemplate: { type: 'boolean' }
        }
      }
    },
    options: {
      type: 'collection',
      items: { type: 'object' }
    },
    properties: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: { type: 'string' } }
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
    belongsToGroup: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'component/groups'
      }
    },
    groups: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'component/items'
        },
        uniqueItems: true
      }
    }
  },
  actions: {
    remove: {
      metadata: {
        title: 'Remove component',
        description: 'Remove a single component and it\'s dependencies',
        icon: 'mdi:layers-remove'
      },
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            component: {
              title: 'Component',
              id: 'action-param-component-item'
            },
            required: true
          },
          stopPropagation: {
            type: 'boolean',
            component: {
              group: 'Options',
              title: 'Prevent further event phases',
              id: 'action-param-boolean'
            }
          }
        }
      },
      /**
       * Remove component
       * @param {Object} param
       * @param {string} param.id
       * @param {boolean} [param.stopPropagation=false]
       * @param {Object} [context]
       * @param {boolean} [isHead=true]
       */
      method ({
        id, stopPropagation = false
      }, context, isHead = true) {
        const parentId = dataGetValue({
          name: 'component/parents',
          id
        }).item
        const parentChildren = dataGetValue({
          name: 'component/children',
          id: parentId
        })

        // remove component from parent
        if (isHead && !parentChildren.isEmpty) {
          const children = []

          // filter out current node
          for (let i = 0; i < parentChildren.item.length; i++) {
            const componentId = parentChildren.item[i]

            if (id !== componentId) {
              children.push(componentId)
            }
          }

          if (!children.length) {
            dataDeleteValue({
              name: 'component/children',
              id: parentId
            })
          } else if (children.length !== parentChildren.item.length) {
            dataSetValue({
              name: 'component/children',
              value: children,
              options: {
                id: parentId,
                stopPropagation
              }
            })
          }
        }

        const events = dataGetValue({
          name: 'component/events',
          id
        })

        // remove event handlers
        if (!events.isEmpty) {
          for (let i = 0; i < events.item.length; i++) {
            const event = events.item[i]

            dataDeleteValue({
              name: 'event/handlers',
              id: event.id
            })
          }
        }

        const content = dataGetValue({
          name: 'component/content',
          id
        })

        if (!content.isEmpty) {
          const contentId = content.item
          const contentComponents = dataGetValue({
            name: 'content/components',
            id: contentId
          })

          if (!contentComponents.isEmpty) {
            if (contentComponents.item.length === 1) {
              const content = dataGetValue({
                name: 'content/languages',
                id: contentId
              })

              dataDeleteValue({
                name: 'content/languages',
                id: contentId
              })
              dataDeleteValue({
                name: 'content/components',
                id: contentId
              })

              // remove all content languages
              for (let i = 0; i < content.item.length; i++) {
                dataDeleteValue({
                  name: 'content/items',
                  id: content.item[i]
                })
              }
            } else {
              // remove current component from content used by list
              dataSetValue({
                name: 'content/components',
                value: id,
                options: {
                  id: contentId,
                  update: { method: 'pull' }
                }
              })
            }
          }

          dataDeleteValue({
            name: 'component/content',
            id
          })
        }

        const children = dataGetValue({
          name: 'component/children',
          id
        })

        if (!children.isEmpty) {
          dataDeleteValue({
            name: 'component/children',
            id,
            stopPropagation: true
          })

          for (let i = 0; i < children.item.length; i++) {
            this.remove({ id: children.item[i] }, context, false)
          }
        }

        // remove component from group
        const componentGroupId = dataGetValue({
          name: 'component/belongsToGroup',
          id
        }).item
        const componentGroup = dataSetValue({
          name: 'component/groups',
          value: id,
          options: {
            id: componentGroupId,
            update: { method: 'pull' }
          }
        })

        // clean up action variables
        if (!componentGroup.item.length) {
          const actionGroupId = dataGetValue({
            name: 'action/valueBelongsToGroup',
            id: componentGroupId
          }).item

          dataDeleteValue({
            name: 'action/values',
            id: componentGroupId
          })

          const valueGroup = dataSetValue({
            name: 'action/valueGroups',
            value: actionGroupId,
            options: {
              id: componentGroupId,
              update: { method: 'pull' }
            }
          })

          if (!valueGroup.isEmpty && !valueGroup.item.length) {
            dataDeleteValue({
              name: 'action/valueGroups',
              id: actionGroupId
            })
          }
        }

        dataDeleteValue({
          name: 'component/belongsToGroup',
          id
        })
        dataDeleteValue({
          name: 'component/nodes',
          id
        })
        dataDeleteValue({
          name: 'component/parents',
          id
        })
        dataDeleteValue({
          name: 'component/roots',
          id
        })
        dataDeleteValue({
          name: 'component/items',
          id
        })
      }
    },
    renderChildren: {
      metadata: {
        title: 'Render children',
        description: 'Render child components',
        icon: 'mdi:layers'
      },
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            component: {
              title: 'Component',
              id: 'action-param-component-item'
            },
            required: true
          },
          items: {
            type: 'array',
            items: {
              type: 'string',
              component: {
                title: 'List of children',
                id: 'action-param-value'
              }
            }
          }
        }
      },
      /**
       * Render children components
       * @param {Object} param
       * @param {string} param.id - Parent component ID
       * @param {string[]} [param.items] - List of child component ID's
       */
      method ({
        id,
        items
      }) {
        if (!items) {
          items = dataGetValue({
            name: 'component/children',
            id
          }).item
        }

        const node = dataGetValue({
          name: 'component/nodes',
          id
        }).item
        const parentGroupId = dataGetValue({
          name: 'component/belongsToGroup',
          id
        }).item
        const children = []
        let childIsLazy = false

        for (let i = 0; i < items.length; i++) {
          const childId = items[i]
          const node = dataGetValue({
            name: 'component/nodes',
            id: childId
          })

          if (!node.isEmpty) {
            children.push({ item: node.item })

            continue
          }

          const item = dataGetValue({
            name: 'component/items',
            id: childId
          }).item

          if (item.isTemplate) {
            const groupId = item.groupId || parentGroupId
            const result = createTemplate({
              id: childId,
              template: $component(item.id),
              parentId: id,
              rootId: childId,
              groupId
            })

            childIsLazy = (result instanceof Promise)
            children.push(result)
          }
        }

        if (childIsLazy) {
          return Promise.all(children)
            .then(results => {
              updateChildren(id, node, results)
            })
            .catch(error => console.error(error))
        } else {
          updateChildren(id, node, children)
        }
      }
    }
  },
  setup ({
    rootId = 'root', component
  }) {
    const rootEl = document.getElementById(rootId)

    if (!rootEl) {
      throw Error('No root element found: #' + rootId)
    }

    attributeObserver = new MutationObserver(function (mutationsList) {
      for (const mutation of mutationsList) {
        // @ts-ignore
        const id = mutation.target.__dooksaId__

        if (attributeObserverCallbacks[id] &&
          typeof attributeObserverCallbacks[id][mutation.attributeName] === 'function'
        ) {
          attributeObserverCallbacks[id][mutation.attributeName](mutation)
        }
      }
    })

    dataUnsafeSetValue({
      name: 'component/nodes',
      value: document.body,
      options: { id: 'body' }
    })

    $component = component

    const rootItem = dataGetValue({
      name: 'component/items',
      id: 'root'
    })
    let element

    if (!rootItem.isEmpty) {
      element = createNode(rootItem.id, rootItem.item)
    } else {
      element = createTemplate({
        id: 'root',
        template: $component('div'),
        parentId: 'root'
      })
    }

    // @ts-ignore
    rootEl.replaceWith(element.item)

    dataAddListener({
      name: 'component/children',
      on: 'delete',
      captureAll: true,
      handler: (data) => {
        for (let i = 0; i < data.item.length; i++) {
          this.remove({ id: data.item[i] })
        }
      }
    })

    dataAddListener({
      name: 'component/children',
      on: 'update',
      captureAll: true,
      handler: (data) => {
        const id = data.id
        const options = {
          name: 'component/childrenBeforeUpdate',
          id,
          context: { id },
          payload: data.item
        }

        eventEmit(options)

        const render = this.renderChildren({
          id,
          items: data.item
        })

        if (render instanceof Promise) {
          render.then(() => {
            options.name = 'component/childrenAfterUpdate'

            eventEmit(options)
          })
        } else {
          options.name = 'component/childrenAfterUpdate'

          eventEmit(options)
        }
      }
    })
  }
})

const componentRemove = component.actions.remove
const componentRenderChildren = component.actions.renderChildren

export {
  component,
  componentRemove,
  componentRenderChildren
}

export default component

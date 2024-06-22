import createPlugin from '@dooksa/create-plugin'
import {
  dataUnsafeSetData,
  dataGenerateId,
  $getDataValue,
  $addDataListener,
  $setDataValue,
  $deleteDataValue,
  $deleteDataListener
} from './data.js'
import { $emit } from './event.js'
import { componentOptions } from '@dooksa/create-component'

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

function getContent (node, content) {
  const result = {}

  for (let i = 0; i < content.length; i++) {
    const item = content[i]

    if (item.propertyName) {
      result[item.propertyName] = node[item.name]
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
  let handlerId = $addDataListener('content/items', {
    on: 'update',
    id: contentId,
    handler: (data) => {
      setContent(node, templateContent, data.item)
    }
  })

  $addDataListener('metadata/currentLanguage', {
    on: 'update',
    handler: (data) => {
      $deleteDataListener('content/items', {
        on: 'update',
        id: contentId,
        handlerId
      })

      // change content lang
      contentId = contentNoAffixId + data.item
      const content = $getDataValue('content/items', { id })

      if (!content.isEmpty) {
        setContent(node, templateContent, content.item)
      }

      handlerId = $addDataListener('content/items', {
        on: 'update',
        id: contentId,
        handler: (data) => {
          setContent(node, templateContent, data.item)
        }
      })
    }
  })

  // update element content if component content is changed
  $addDataListener('component/content', {
    on: 'update',
    id,
    handler: (data) => {
      const content = $getDataValue('content/items', { id: data.item })

      setContent(node, templateContent, content.item)
    }
  })
}

function createNode (id, item) {
  const options = { id }
  const template = _$component(item.id)
  let node

  if (!template.isLoaded) {
    return lazyLoad({
      id,
      item
    }, template, createNode)
  }

  // Custom element constructor
  if (typeof template.initialize === 'function') {
    node = template.initialize()
  } else {
    // create element
    node = document.createElement(template.tag)
  }

  node.dooksaComponentId = id
  dataUnsafeSetData('component/nodes', node, { id })

  const properties = $getDataValue('component/properties', options).item || template.properties

  if (!properties) {
    setProperties(node, properties)

    $addDataListener('component/properties', {
      on: 'update',
      id,
      handler: (options) => {
        setProperties(node, options.item)
      }
    })
  }

  if (template.options) {
    $addDataListener('component/options', {
      on: 'update',
      id,
      handler: (options) => {
        const properties = componentOptions(options.item, template.options, template.properties)

        $setDataValue('component/properties', properties, { id })
      }
    })
  }

  const content = $getDataValue('component/content', { id, options: { expand: true } })
  let contentId
  if (!content.isEmpty) {
    const contentData = content.extend[0]
    const template = _$component(item.id)

    contentId = contentData.noAffixId
    setContent(node, template.content, contentData.item)
    contentListeners(id, contentData.id, contentId, node, template.content)
  }

  const children = $getDataValue('component/children', { id, options: { expand: true } })
  const rootId = $getDataValue('component/roots', options).item
  const groupId = $getDataValue('component/groups', options).item
  const parentId = $getDataValue('component/parents', options).item
  const events = $getDataValue('component/events', options)
  const childNodes = []
  let childIsLazy = false
  let hasCreateEvent = false

  if (!events.isEmpty) {
    const events = events.item
    const eventTypes = template.eventTypes || {}
    const hasEvent = {}

    for (let i = 0; i < events.length; i++) {
      const { on, actionId } = events[i]
      const eventData = $setDataValue('event/listeners', actionId, {
        id,
        suffixId: 'component/' + on,
        update: {
          method: 'push'
        }
      })

      if (on === 'component/create') {
        hasCreateEvent = true
      }

      $setDataValue('component/events', {
        id: eventData.id,
        on,
        actionId
      }, {
        id,
        update: {
          method: 'push'
        }
      })

      if (eventTypes[on] && !hasEvent[on]) {
        const nodeEvent = on.split('/')

        if (nodeEvent[0] === 'node') {
          hasEvent[on] = true
          const handler = (payload) => {
            // fire node events
            $emit(on, {
              id,
              context: {
                id,
                rootId,
                parentId,
                groupId
              },
              payload
            })
          }

          node.addEventListener(nodeEvent[1], handler)

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
        }
      }
    }

    // fire mount event
    $emit('component/mount', {
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

  if (!children.isEmpty) {
    for (let i = 0; i < children.expand.length; i++) {
      const component = children.expand[i]
      let childNode = $getDataValue('component/nodes', { id: component.id })

      if (component.item.isTemplate) {
        childNode = createTemplate({
          id: component.id,
          template: _$component(component.item.id),
          parentId: id,
          rootId: component.id,
          groupId: component.id
        })

        childIsLazy = (childNode instanceof Promise)
      }

      childNodes.push(childNode)
    }

    if (childIsLazy) {
      Promise.all(childNodes)
        .then(result => {
          for (let i = 0; i < result.length; i++) {
            node.appendChild(result[i].item)
          }

          if (hasCreateEvent) {
            // fire created event
            $emit('component/create', {
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
        })
        .catch(error => console.error(error))
    } else {
      for (let i = 0; i < childNodes.length; i++) {
        node.appendChild(childNodes[i].item)
      }
    }
  }

  if (hasCreateEvent && !childIsLazy) {
    // fire created event
    $emit('component/create', {
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

  return {
    id,
    item: node
  }
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
  id = dataGenerateId(),
  template,
  parentId,
  rootId = id,
  groupId = id
}) {
  const component = {
    id: template.id,
    hash: template.hash,
    type: template.type
  }
  const properties = {}
  let node
  let contentId

  if (!template.isLoaded) {
    return lazyLoad({
      id,
      template,
      parentId,
      groupId
    }, template, createTemplate)
  }

  // Custom element constructor
  if (typeof template.initialize === 'function') {
    node = template.initialize()
  } else {
    // create element
    node = document.createElement(template.tag)
  }

  // store node
  node.dooksaComponentId = id
  dataUnsafeSetData('component/nodes', node, { id })

  // set core component values
  $setDataValue('component/groups', groupId, { id })
  $setDataValue('component/roots', rootId, { id })
  $setDataValue('component/parents', parentId, { id })
  $setDataValue('component/items', component, { id })

  // set properties to node
  if (template.properties) {
    for (let i = 0; i < template.properties.length; i++) {
      const { name, value } = template.properties[i]

      // prepare default content values
      properties[name] = value
    }

    setProperties(node, template.properties)

    $addDataListener('component/properties', {
      on: 'update',
      id,
      handler: (options) => {
        setProperties(node, options.item)
      }
    })
  }

  // set content
  if (template.content) {
    const content = {}
    const nodeValues = getContent(node, template.content)

    for (let i = 0; i < template.content.length; i++) {
      const data = template.content[i]
      let contentValue = properties[data.propertyName]

      if (contentValue == null) {
        contentValue = nodeValues[data.propertyName]
      }

      // add default value from props
      content[data.name] = contentValue
    }

    const contentData = $setDataValue('content/items', content)
    contentId = contentData.noAffixId

    setContent(node, template.content, content)
    $setDataValue('component/content', contentId, { id })
    contentListeners(id, contentData.id, contentData.noAffixId, node, template.content)
  }

  if (template.options) {
    $addDataListener('component/options', {
      on: 'update',
      id,
      handler: (options) => {
        const properties = componentOptions(options.item, template.options, template.properties)

        $setDataValue('component/properties', properties, { id })
      }
    })
  }

  const childNodes = []
  let childIsLazy = false
  let hasCreateEvent = false

  // set events
  if (template.events) {
    const events = template.events
    const eventTypes = template.eventTypes || {}
    const hasEvent = {}

    for (let i = 0; i < events.length; i++) {
      const { on, actionId } = events[i]
      const eventData = $setDataValue('event/listeners', actionId, {
        id,
        suffixId: on,
        update: {
          method: 'push'
        }
      })

      if (on === 'component/create') {
        hasCreateEvent = true
      }

      $setDataValue('component/events', {
        id: eventData.id,
        on,
        actionId
      }, {
        id,
        update: {
          method: 'push'
        }
      })

      if (eventTypes[on] && !hasEvent[on]) {
        const nodeEvent = on.split('/')

        if (nodeEvent[0] === 'node') {
          hasEvent[on] = true
          const handler = (payload) => {
            // fire node events
            $emit(on, {
              id,
              context: {
                id,
                rootId,
                parentId,
                groupId
              },
              payload
            })
          }

          node.addEventListener(nodeEvent[1], handler)

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
        }
      }
    }

    // fire mount event
    $emit('component/mount', {
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

  if (template.children) {
    for (let i = 0; i < template.children.length; i++) {
      const result = createTemplate({
        template: template.children[i],
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
        .then(results => {
          const children = []

          for (let i = 0; i < results.length; i++) {
            const result = results[i]
            node.appendChild(result.item)
            children.push(result.id)
          }

          $setDataValue('component/children', children, {
            id,
            stopPropagation: true
          })

          if (hasCreateEvent) {
            // fire mount event
            $emit('component/create', {
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
        })
        .catch(error => console.error(error))
    } else {
      const children = []
      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i]

        node.appendChild(childNode.item)
        children.push(childNode.id)
      }

      $setDataValue('component/children', children, {
        id,
        stopPropagation: true
      })
    }
  }

  // fire created event
  if (hasCreateEvent && !childIsLazy) {
    $emit('component/create', {
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

  return {
    id,
    item: node
  }
}


function updateChildren (parent, childNodes) {
  if (parent.childNodes.length > childNodes.length) {
    parent: for (let i = 0; i < parent.childNodes.length; i++) {
      const prevNode = parent.childNodes[i]

      // check if node exists in new list
      for (let i = 0; i < childNodes.length; i++) {
        const nextNode = childNodes[i].item

        if (nextNode === prevNode) {
          continue parent
        }
      }

      // remove unused node
      componentRemove({ id: prevNode.dooksaComponentId })
      prevNode.remove()
    }
  } else {
    for (let i = 0; i < childNodes.length; i++) {
      const nextNode = childNodes[i].item
      const prevNode = parent.childNodes[i]

      if (nextNode !== prevNode) {
        if (!prevNode) {
          parent.appendChild(nextNode)
        } else {
          parent.insertBefore(nextNode, prevNode)
        }
      }
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
          hash: {
            type: 'string'
          },
          isTemplate: {
            type: 'boolean'
          }
        }
      }
    },
    options: {
      type: 'collection',
      items: {
        type: 'object'
      }
    },
    properties: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
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

          $deleteDataValue('content/items', contentId)
        }
      }

      const children = $getDataValue('component/children', { id })

      if (!children.isEmpty) {
        $deleteDataValue('component/children', id)
      }

      $deleteDataValue('component/groups', id)
      $deleteDataValue('component/nodes', id)
      $deleteDataValue('component/parents', id)
      $deleteDataValue('component/items', id)
      $deleteDataValue('component/roots', id)
    },
    renderChildren ({
      id,
      items = $getDataValue('component/children', { id }).item
    }) {
      const options = { id }
      const node = $getDataValue('component/nodes', options).item
      const parentGroupId = $getDataValue('component/groups', options).item
      const children = []
      let childIsLazy = false

      for (let i = 0; i < items.length; i++) {
        const childId = items[i]
        const options = { id: childId }
        const node = $getDataValue('component/nodes', options)

        if (!node.isEmpty) {
          children.push({
            item: node.item
          })

          continue
        }

        const item = $getDataValue('component/items', options).item

        if (item.isTemplate) {
          const groupId = item.groupId || parentGroupId

          const result = createTemplate({
            id: childId,
            template: _$component(item.id),
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
            updateChildren(node, results)
          })
          .catch(error => console.error(error))
      } else {
        updateChildren(node, children)
      }
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

    const rootItem = $getDataValue('component/items', { id: 'root' })
    let element

    if (!rootItem.isEmpty) {
      element = createNode(rootItem.id, rootItem.item)
    } else {
      element = createTemplate({
        id: 'root',
        template: _$component('div'),
        parentId: 'root'
      })
    }

    // @ts-ignore
    rootEl.replaceWith(element.item)

    $addDataListener('component/children', {
      on: 'delete',
      capture: 'all',
      handler: (data) => {
        for (let i = 0; i < data.item.length; i++) {
          this.remove({
            id: data.item[i]
          })
        }
      }
    })

    $addDataListener('component/children', {
      on: 'update',
      capture: 'all',
      handler: (data) => {
        const id = data.id
        const options = {
          id,
          context: { id },
          payload: data.item
        }

        $emit('component/childrenBeforeUpdate', options)

        const render = this.renderChildren({ id, items: data.item })

        if (render instanceof Promise) {
          render.then(() => [
            $emit('component/childrenAfterUpdate', options)
          ])
        } else {
          $emit('component/childrenAfterUpdate', options)
        }
      }
    })
  }
})

const componentRemove = component.actions.remove
const componentRenderChildren = component.actions.renderChildren

export {
  componentRemove,
  componentRenderChildren
}

export default component

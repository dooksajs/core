import { createPlugin } from '@dooksa/create-plugin'
import { componentOptions } from '@dooksa/create-component'
import {
  eventEmit,
  stateUnsafeSetValue,
  stateGetValue,
  stateAddListener,
  stateSetValue,
  stateDeleteValue
} from '#client'
import { generateId } from '@dooksa/utils'

/**
 * @import {Component, ComponentEvent, ComponentInstance} from '@dooksa/create-component'
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
 * @property {ComponentEvent[]} [events]
 * @property {ComponentItem[]} [children]
 */

/**
 * isTemporary is for components that are not intended to be saved in page state (usually used for dynamic content)
 */

export const component = createPlugin('component', {
  metadata: {
    title: 'Component',
    description: '',
    icon: 'mdi:widgets'
  },
  state: {
    schema: {
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
      },
      belongsToScopes: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'action/scopes'
          },
          uniqueItems: true
        }
      }
    }
  },
  data: {
    /** @type {Object.<string, Component>} */
    components: {},
    attributeObserverCallbacks: {},
    attributeObserver: null
  },
  privateMethods: {
    /**
     * @param {string} id - Component ID
     * @returns {Component}
     */
    getById (id) {
      if (this.components[id] == null) {
        throw new Error('DooksaError: Could not found component "' + id + '"')
      }

      return this.components[id]
    },
    objectHasSetter (object, property, result = { hasSetter: false }) {
      const descriptor = Object.getOwnPropertyDescriptor(object, property)

      if (descriptor && descriptor.set) {
        result.hasSetter = true

        return
      }

      const prototype = Object.getPrototypeOf(object)

      if (prototype) {
        this.objectHasSetter(prototype, property, result)
      }

      return result.hasSetter
    },
    /**
     * Set properties to element
     * @param {HTMLElement} element - view node id
     * @param {Object[]} properties
     * @private
     */
    setProperties (element, properties = []) {
      for (let i = 0; i < properties.length; i++) {
        const { name, value } = properties[i]

        // check if element named has attribute or setter
        if ((element.hasAttribute && element.hasAttribute(name)) || this.objectHasSetter(element, name)) {
          element[name] = value
        } else {
          // set new attribute
          element.setAttribute(name, value)
        }
      }
    },
    /**
     * @template T
     * @param {T} item
     * @param {Object} template
     * @param {function} cb
     * @returns {Promise<T>}
     */
    lazyLoad (item, template, cb) {
      return new Promise((resolve, reject) => {
        template.component()
          .then(() => {
            template.isLoaded = true

            resolve(cb(item))
          })
          .catch(error => reject(error))
      })
    },
    createNode (id, item) {
      const template = this.getById(item.id)
      let node

      if (!template.isLoaded) {
        return this.lazyLoad({
          id,
          item
        }, template, this.createNode)
      }

      // Custom element constructor
      if (typeof template.initialize === 'function') {
        node = template.initialize({ id }, eventEmit)
      } else {
        // create element
        node = document.createElement(template.tag)
      }

      // append dooksa id to node
      Object.defineProperty(node, '__dooksaId__', {
        value: id,
        enumerable: false
      })

      stateUnsafeSetValue({
        name: 'component/nodes',
        value: node,
        options: { id }
      })

      const properties = stateGetValue({
        name: 'component/properties',
        id
      }).item || template.properties

      if (!properties) {
        this.setProperties(node, properties)

        stateAddListener({
          name: 'component/properties',
          on: 'update',
          id,
          handler: (options) => {
            this.setProperties(node, options.item)
          }
        })
      }

      if (template.options) {
        stateAddListener({
          name: 'component/options',
          on: 'update',
          id,
          handler: (options) => {
            const properties = componentOptions(options.item, template.options, template.properties)

            stateSetValue({
              name: 'component/properties',
              value: properties,
              options: { id }
            })
          }
        })
      }

      const children = stateGetValue({
        name: 'component/children',
        id,
        options: { expand: true }
      })
      const rootId = stateGetValue({
        name: 'component/roots',
        id
      }).item
      const groupId = stateGetValue({
        name: 'component/belongsToGroup',
        id
      }).item
      const parentId = stateGetValue({
        name: 'component/parents',
        id
      }).item
      const event = stateGetValue({
        name: 'component/events',
        id
      })

      const context = {
        id,
        rootId,
        parentId,
        groupId
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
          const eventData = stateSetValue({
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

          stateSetValue({
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

              this.nodeEvent(eventType, eventValue, node, on, id, context)
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
              this.createChildNodes(
                node,
                children.expand,
                id,
                rootId,
                groupId
              )
            })
        } else {
          this.createChildNodes(
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
    },
    /**
     * Observe node prototype property
     * @param {HTMLElement} element
     * @param {string} property - Property name of getter/setter
     * @param {Function} callback
     */
    observeNodeProperty (element, property, callback) {
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
    },
    /**
     * Attribute observer handler
     * @param {Function} callback
     */
    observeNodeAttributeCallback (callback) {
      return function (mutation) {
        const prop = mutation.attributeName

        callback({
          prop,
          oldValue: mutation.oldValue,
          value: mutation.target.getAttribute(prop)
        })
      }
    },
    /**
     * Observe node attribute
     * @param {string} id
     * @param {HTMLElement} element
     * @param {string} property
     * @param {Function} callback
     */
    observeNodeAttribute (id, element, property, callback) {
      const attributeCallback = this.observeNodeAttributeCallback(callback)

      // add attribute observer callback
      if (!this.attributeObserverCallbacks[id]) {
        this.attributeObserverCallbacks[id] = { [property]: attributeCallback }
      } else {
        this.attributeObserverCallbacks[id][property] = attributeCallback
      }

      // observe element
      this.attributeObserver.observe(element, {
        attributes: true,
        attributeOldValue: true
      })
    },
    nodeEvent (eventType, eventValue, node, on, id, context) {
      const handler = (payload) => {
        // fire node events
        eventEmit({
          name: on,
          id,
          context,
          payload
        })
      }
      let removeHandler = () => {
      }

      switch (eventType) {
        case 'node':
          if (eventValue !== 'checked') {
            node.addEventListener(eventValue, handler)
          } else {
            node.addEventListener('input', handler)

            this.observeNodeProperty(node, eventValue, (value) => {
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
          this.observeNodeProperty(node, eventValue, (value) => {
            handler({
              prop: eventValue,
              value
            })
          })
          break
        case 'observeAttribute':
          this.observeNodeAttribute(id, node, eventValue, handler)
          removeHandler = () => {
            delete this.attributeObserverCallbacks[id][eventValue]

            // clear node
            if (!Object.keys(this.attributeObserverCallbacks[id]).length) {
              delete this.attributeObserverCallbacks[id]
            }
          }
          break
      }

      // handle removal
      stateAddListener({
        name: 'event/handlers',
        on: 'delete',
        id,
        handler () {
          removeHandler()
        }
      })

      // store handler
      stateUnsafeSetValue({
        name: 'event/handlers',
        value: handler,
        options: { id }
      })
    },
    /**
     * Create node from template
     * @param {Object} param
     * @param {string} [param.id],
     * @param {Component} param.template
     * @param {string} param.parentId
     * @param {string} [param.rootId]
     * @param {string} [param.groupId]
     */
    createTemplate ({
      id = generateId(),
      template,
      parentId,
      rootId,
      groupId
    }) {
      const component = {
        id: template.id,
        type: template.type
      }
      const options = { id }
      const properties = Object.create(null)
      let node
      let parentGroupId
      const parentGroup = stateGetValue({
        name: 'component/belongsToGroup',
        id: parentId
      })

      if (parentGroup.isEmpty) {
        parentGroupId = 'global'
      } else {
        parentGroupId = parentGroup.item
      }

      if (!groupId) {
        // assign parent group id
        groupId = parentGroupId
      }

      if (!rootId) {
        // this instance is the root node
        rootId = id

        const parentRootId = stateGetValue({
          name: 'component/roots',
          id: parentId
        })

        if (!parentRootId.isEmpty) {
          const parentRootScope = stateGetValue({
            name: 'variable/scopes',
            id: parentRootId.item,
            options: {
              clone: true
            }
          })

          if (!parentRootScope.isEmpty) {
            const scope = parentRootScope.item

            if (parentGroupId !== groupId) {
              // add new group to scope
              scope.unshift(groupId)
            }

            // add current root node to scope
            scope.unshift(id)

            // set new group scope
            stateSetValue({
              name: 'variable/scopes',
              value: scope,
              options: {
                id,
                replace: true
              }
            })
          }
        } else {
          // set new group scope
          stateSetValue({
            name: 'variable/scopes',
            value: [id, groupId],
            options: {
              id,
              replace: true
            }
          })
        }
      }

      if (!template.isLoaded) {
        return this.lazyLoad({
          id,
          template,
          parentId,
          rootId,
          groupId
        }, template, this.createTemplate)
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

      // append dooksa id to node
      Object.defineProperty(node, '__dooksaId__', {
        value: id,
        enumerable: false
      })

      stateUnsafeSetValue({
        name: 'component/nodes',
        value: node,
        options
      })

      // set core component values
      stateSetValue({
        name: 'component/roots',
        value: rootId,
        options
      })
      stateSetValue({
        name: 'component/parents',
        value: parentId,
        options
      })
      stateSetValue({
        name: 'component/items',
        value: component,
        options
      })

      // set group
      stateSetValue({
        name: 'component/groups',
        value: id,
        options: {
          id: groupId,
          update: { method: 'push' }
        }
      })
      stateSetValue({
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

        this.setProperties(node, template.properties)
      }

      if (template.options) {
        // Update element attributes
        stateAddListener({
          name: 'component/properties',
          on: 'update',
          id,
          handler: (options) => {
            this.setProperties(node, options.item)
          }
        })

        // Compile component options
        const handler = (optionData) => {
          const properties = componentOptions(
            optionData.item,
            template.options,
            template.properties
          )

          stateSetValue({
            name: 'component/properties',
            value: properties,
            options: { id }
          })
        }

        const options = stateGetValue({
          name: 'component/options',
          id
        })

        // update properties if options exist
        if (!options.isEmpty) {
          handler(options)
        }

        // Update component options/properties
        stateAddListener({
          name: 'component/options',
          on: 'update',
          id,
          handler
        })
      }

      const context = {
        id,
        rootId,
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
          const eventData = stateSetValue({
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

          stateSetValue({
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

              this.nodeEvent(eventType, eventValue, node, on, id, context)
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
              this.createTemplateChildNodes(
                node,
                template.children,
                id,
                rootId,
                groupId
              )
            })
        } else {
          this.createTemplateChildNodes(
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
          context,
          payload: node
        })
      }

      return {
        id,
        item: node
      }
    },
    createChildNodes (node, components, parentId, parentRootId, parentGroupId) {
      let childIsLazy = false
      let childNodes = []

      for (let i = 0; i < components.length; i++) {
        const {
          id,
          item
        } = components[i]
        let childNode = stateGetValue({
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

          childNode = this.createTemplate({
            id,
            template: this.getById(item.id),
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
    },
    createTemplateChildNodes (node, children, id, rootId, groupId) {
      const childNodes = []
      let childIsLazy = false

      for (let i = 0; i < children.length; i++) {
        const result = this.createTemplate({
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
            this.appendChildNodes(id, node, childNodes)
          })
          .catch(error => console.error(error))
      } else {
        this.appendChildNodes(id, node, childNodes)
      }
    },
    appendChildNodes (id, node, childNodes) {
      const value = []

      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i]
        // append child node
        node.appendChild(childNode.item)
        // store component id
        value.push(childNode.id)
      }

      // set children component ids to parent
      stateSetValue({
        name: 'component/children',
        value,
        options: {
          id,
          stopPropagation: true
        }
      })
    },
    updateChildren (id, parent, nextChildNodes) {
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
          const prevNodeBelongsTo = stateGetValue({
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
        const parentId = stateGetValue({
          name: 'component/parents',
          id
        }).item
        const parentChildren = stateGetValue({
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
            stateDeleteValue({
              name: 'component/children',
              id: parentId
            })
          } else if (children.length !== parentChildren.item.length) {
            stateSetValue({
              name: 'component/children',
              value: children,
              options: {
                id: parentId,
                stopPropagation
              }
            })
          }
        }

        const events = stateGetValue({
          name: 'component/events',
          id
        })

        // remove event handlers
        if (!events.isEmpty) {
          for (let i = 0; i < events.item.length; i++) {
            const event = events.item[i]

            stateDeleteValue({
              name: 'event/handlers',
              id: event.id
            })
          }
        }

        const children = stateGetValue({
          name: 'component/children',
          id
        })

        if (!children.isEmpty) {
          stateDeleteValue({
            name: 'component/children',
            id,
            stopPropagation: true
          })

          for (let i = 0; i < children.item.length; i++) {
            // @ts-ignore
            this.remove({ id: children.item[i] }, context, false)
          }
        }

        // remove component from group
        const componentGroupId = stateGetValue({
          name: 'component/belongsToGroup',
          id
        })

        if (!componentGroupId.isEmpty) {
          const id = componentGroupId.item
          const componentGroup = stateSetValue({
            name: 'component/groups',
            value: id,
            options: {
              id,
              update: { method: 'pull' }
            }
          })

          // clean up action variables
          if (!componentGroup.item.length) {
            // delete group block variables
            stateDeleteValue({
              name: 'variable/values',
              id
            })

            // delete value group
            stateDeleteValue({
              name: 'variable/scopes',
              id
            })
          }
        }

        // delete variable scopes
        stateDeleteValue({
          name: 'variable/scopes',
          id
        })

        // delete local variables
        stateDeleteValue({
          name: 'variable/values',
          id
        })


        // delete component defined scopes
        const scopes = stateGetValue({
          name: 'component/belongsToScopes',
          id
        })

        if (!scopes.isEmpty) {
          for (let i = 0; i < scopes.item.length; i++) {
            const scopeId = scopes.item[i]
            const group = stateGetValue({
              name: 'component/groups',
              id: scopeId
            })

            // check if scope belongs to an existing group
            if (group.isEmpty || (!group.isEmpty && !group.item.length)) {
              // delete values in scope
              stateDeleteValue({
                name: 'variable/values',
                id: scopeId
              })
            }
          }
        }

        stateDeleteValue({
          name: 'component/belongsToGroup',
          id
        })
        stateDeleteValue({
          name: 'component/nodes',
          id
        })
        stateDeleteValue({
          name: 'component/parents',
          id
        })
        stateDeleteValue({
          name: 'component/roots',
          id
        })
        stateDeleteValue({
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
          items = stateGetValue({
            name: 'component/children',
            id
          }).item
        }

        const node = stateGetValue({
          name: 'component/nodes',
          id
        }).item
        const children = []
        let childIsLazy = false

        for (let i = 0; i < items.length; i++) {
          const childId = items[i]
          const node = stateGetValue({
            name: 'component/nodes',
            id: childId
          })

          if (!node.isEmpty) {
            children.push({ item: node.item })

            continue
          }

          const item = stateGetValue({
            name: 'component/items',
            id: childId
          }).item

          if (item.isTemplate) {
            const result = this.createTemplate({
              id: childId,
              template: this.getById(item.id),
              parentId: id,
              groupId: item.groupId
            })

            childIsLazy = (result instanceof Promise)
            children.push(result)
          }
        }

        if (childIsLazy) {
          return Promise.all(children)
            .then(results => {
              this.updateChildren(id, node, results)
            })
            .catch(error => console.error(error))
        } else {
          this.updateChildren(id, node, children)
        }
      }
    }
  },
  /**
   * @param {Object} options
   * @param {string} options.rootId - Root element ID used to mount Dooksa
   * @param {Object.<string, Component>} options.components - Fetch component function
   */
  setup ({
    rootId = 'root',
    components
  }) {
    const rootEl = document.getElementById(rootId)

    if (!rootEl) {
      throw Error('No root element found: #' + rootId)
    }

    this.attributeObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        // @ts-ignore
        const id = mutation.target.__dooksaId__

        if (this.attributeObserverCallbacks[id] &&
          typeof this.attributeObserverCallbacks[id][mutation.attributeName] === 'function'
        ) {
          this.attributeObserverCallbacks[id][mutation.attributeName](mutation)
        }
      }
    })

    stateUnsafeSetValue({
      name: 'component/nodes',
      value: document.body,
      options: { id: 'body' }
    })

    // set available components
    this.components = components

    const rootItem = stateGetValue({
      name: 'component/items',
      id: 'root'
    })
    let element

    if (!rootItem.isEmpty) {
      element = this.createNode(rootItem.id, rootItem.item)
    } else {
      element = this.createTemplate({
        id: 'root',
        template: this.getById('div'),
        parentId: 'root'
      })
    }

    // @ts-ignore
    rootEl.replaceWith(element.item)

    stateAddListener({
      name: 'component/children',
      on: 'delete',
      captureAll: true,
      handler: (data) => {
        for (let i = 0; i < data.item.length; i++) {
          this.remove({ id: data.item[i] })
        }
      }
    })

    stateAddListener({
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

export const {
  componentRemove,
  componentRenderChildren
} = component

export default component

import { definePlugin } from '@dooksa/ds-scripts'
import { getNodeValue } from '@dooksa/utils'

/**
 * @typedef {string} dsViewId - dsView node id
 * @example <caption>Example of string value</caption>
 * "_v53KKewgkeUQuwDXUnlArp_0000"
 */

/**
 * @namespace dsView
 */
export default definePlugin({
  name: 'dsView',
  version: 1,
  data: {
    rootViewId: {
      default: () => 'rootElement',
      schema: {
        type: 'string'
      }
    },
    attributes: {
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    },
    content: {
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsContent/items'
        }
      }
    },
    handlers: {
      schema: {
        type: 'collection',
        uniqueItems: true,
        items: {
          type: 'array'
        }
      }
    },
    items: {
      schema: {
        type: 'collection',
        items: {
          type: 'node'
        }
      }
    },
    itemParent: {
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    }
  },
  /**
   * Setup plugin
   * @param {Object} options
   * @param {string} [options.rootElementId = 'root'] - Root element id
   */
  setup ({ rootElementId = 'root' } = {}) {
    // get root element from the DOM
    const rootElement = document.getElementById(rootElementId)

    if (!rootElement) {
      this.$log('error', { message: 'Could not find root element: ' + rootElement, code: '40' })
    }

    // Set root element
    const dsViewId = this.createNode({
      dsViewId: 'rootElement',
      dsComponentId: '43f4f4c34d66e648'
    })

    this.$setDataValue('dsView/rootViewId', dsViewId)

    // get root element
    const dsView = this.$getDataValue('dsView/items', {
      id: dsViewId
    })

    // replace root element with new app element
    rootElement.parentElement.replaceChild(dsView.item, rootElement)
  },
  methods: {
    /**
     * Adds a node to the end of the list of children of a specified parent node
     * @param {Object} item
     * @param {dsViewId} item.targetId - Child dsView node id
     * @param {dsViewId} item.sourceId - Parent dsView node id
     * @param {string} item.dsWidgetId - Widget id
     * @param {string} item.dsWidgetMode - Widget mode
     * @param {string} [item.type] - type of insert method
     */
    insert ({ targetId, sourceId, dsWidgetId, dsWidgetMode, type = 'append' }) {
      const target = this.$getDataValue('dsView/items', {
        id: targetId
      })
      const source = this.$getDataValue('dsView/items', {
        id: sourceId
      })

      this['_insert/' + type](target.item, source.item)

      this.$emit('dsView/mount', {
        id: sourceId,
        context: {
          targetId,
          sourceId,
          dsWidgetId,
          dsWidgetMode
        }
      })

      this.$addDataListener('dsView/items', {
        on: 'delete',
        id: sourceId,
        handler: {
          id: sourceId,
          value: () => {
            this.$deleteDataValue('dsView/items', sourceId)
          }
        }
      })
    },
    /**
     * Creates node
     * @param {Object} item
     * @param {string} item.dsViewId - View id
     * @param {string} item.dsComponentId - Component id
     * @param {string} item.dsSectionId - Section id from dsWidget
     * @param {string} item.dsWidgetId - Instance id from dsWidget
     * @param {Array.<string[]>} item.additionalAttributes - Additional element attributes
     */
    createNode ({
      dsViewId,
      dsComponentId,
      dsSectionId,
      dsWidgetId,
      additionalAttributes
    }) {
      let dsComponent = this.$getDataValue('dsComponent/items', {
        id: dsComponentId
      })

      if (dsComponent.isEmpty) {
        return
      }

      dsComponent = dsComponent.item

      dsViewId = dsViewId || this.$method('dsData/generateId')
      let element

      if (dsComponent.id === 'text') {
        element = document.createTextNode('')
      } else {
        element = document.createElement(dsComponent.id)
      }

      element.dsViewId = dsViewId

      this.$method('dsData/unsafeSetData', {
        name: 'dsView/items',
        data: element,
        options: {
          id: dsViewId
        }
      })

      if (additionalAttributes) {
        this._setAttributes(element, additionalAttributes)
      }

      if (dsComponent.attributes) {
        this._setAttributes(element, dsComponent.attributes)
      }

      const component = this.$component(dsComponent.id)

      // ISSUE: [DS-889] Only add events if in edit mode
      if (component && component.events) {
        for (let i = 0; i < component.events.length; i++) {
          const event = component.events[i]
          const name = event.name || event

          const handler = (e) => {
            e.preventDefault()
            const dsViewContent = this.$getDataValue('dsView/content', {
              id: dsViewId
            })

            if (event.syncContent) {
              const value = this.getValue({ id: dsViewId })

              this.$setDataValue('dsContent/items', value, { id: dsViewContent.item })
            }

            this.$emit(name, {
              id: dsViewId,
              context: {
                dsViewId,
                dsContentId: dsViewContent.item,
                dsWidgetId,
                dsSectionId,
                event
              }
            })
          }

          element.addEventListener(name, handler)

          this.$setDataValue('dsView/handlers', handler, {
            id: dsViewId,
            update: {
              method: 'push'
            }
          })
        }
      }

      return dsViewId
    },
    /**
     * Get value from node item
     * @param {dsViewId} dsViewId - dsView node id
     * @returns {string|Object} - Either a string or Object based on the components getter
     */
    getValue ({ id }) {
      const dsView = this.$getDataValue('dsView/items', {
        id
      })

      if (dsView.isEmpty) {
        throw Error('No view item found')
      }

      const nodeName = dsView.item.nodeName.toLowerCase()
      const getters = this.$componentGetters[nodeName]

      if (getters) {
        const node = dsView.item
        const item = {
          values: {}
        }

        // get node value
        for (let i = 0; i < getters.length; i++) {
          const getter = getters[i]
          const result = getNodeValue(node, getter.type, getter.name, getter.token)
          const property = getter.property

          item.values[property] = result.value

          if (getter.token) {
            if (!item.tokens) {
              item.tokens = {}
            }

            item.tokens[property] = result.token
          }
        }

        return item
      }
    },
    /**
     * Remove node from DOM
     * @param {object} param - dsView node id
     * @param {string} param.id - dsView node id
     */
    remove ({ id }) {
      const dsView = this.$getDataValue('dsView/items', { id })

      if (!dsView.isEmpty) {
        // remove content attachment
        this._unmount(id)

        this.$deleteDataValue('dsView/handlers', id)

        dsView.item.remove()
      }
    },
    /**
     * Remove all child nodes from select node
     * @param {dsViewId} dsViewId - dsView node id
     */
    removeChildren (dsViewId) {
      const dsView = this.$getDataValue('dsView/items', {
        id: dsViewId
      })

      if (!dsView.isEmpty && dsView.item.lastChild) {
        const node = dsView.item

        while (node.lastChild) {
          this._unmount(node.lastChild.dsViewId)
          this._removeHandlers(node.lastChild.dsViewId)

          node.removeChild(node.lastChild)
        }

        this.$emit('dsView/unmount', {
          id: dsViewId,
          context: { dsViewId }
        })
      }
    },
    /**
     * Replaces a child node within the given (parent) node
     * @param {Object} node
     * @param {dsViewId} node.dsViewParentId - Parent dsView id
     * @param {dsViewId} node.dsViewId - Child dsView id
     * @param {dsViewId} node.dsViewIdPrev - Replacement child dsView id
     * @param {number} node.childIndex - Index of replacement child
     */
    replace ({ dsViewParentId, dsViewId, dsViewIdPrev, childIndex }) {
      const dsViewChild = this.$getDataValue('dsView/items', {
        id: dsViewId
      })

      let dsViewPrevChild, dsViewParent

      if (dsViewIdPrev) {
        dsViewPrevChild = this.$getDataValue('dsView/items', {
          id: dsViewIdPrev
        })
        dsViewParent = dsViewPrevChild.item.parentElement
      } else if (!isNaN(childIndex)) {
        dsViewParent = this.$getDataValue('dsView/items', {
          id: dsViewParentId
        })

        dsViewPrevChild = dsViewParent.item.childNodes[childIndex]
      }

      // replace old child with new child
      if (dsViewPrevChild) {
        dsViewPrevChild.item.replaceWidth(dsViewChild.item)

        // emit old child unmount
        this._unmount(dsViewPrevChild.item.dsViewId)

        // emit new child mount
        this.$emit('dsView/mount', {
          id: dsViewId,
          context: { dsViewId }
        })

        // update parents
        this.$setDataValue('dsView/itemParent', dsViewParent.item.dsViewId, {
          id: dsViewId
        })
      }
    },
    /**
     * Update node value
     * @param {Object} node
     * @param {dsViewId} node.dsViewId - dsView node id
     * @param {dsContentValue} node.value - dsContent value
     * @param {dsContentLanguage} node.language - dsContent language code
     */
    updateValue ({ dsViewId, language }) {
      const dsView = this.$getDataValue('dsView/items', {
        id: dsViewId
      })

      if (dsView.isEmpty) {
        throw Error('No view item found')
      }

      let dsContentId = this.$getDataValue('dsView/content', {
        id: dsViewId
      })

      if (dsContentId.isEmpty) {
        throw Error('No content attached to view item')
      }

      dsContentId = dsContentId.item

      const dsContent = this.$getDataValue('dsContent/items', {
        id: dsContentId
      })

      // exit if content is empty
      if (dsContent.isEmpty) {
        return
      }

      const node = dsView.item
      const nodeName = node.nodeName.toLowerCase()
      this.$component(nodeName)
      const setters = this.$componentSetters[nodeName]

      if (setters) {
        for (let i = 0; i < setters.length; i++) {
          const setter = setters[i]
          const content = dsContent.item.values

          if (setter.token && dsContent.item.tokens[setter.property]) {
            this['_setValueBy/token'](node, content, setter.name, setter.property, setter.type, dsViewId)

            continue
          }

          this[`_setValueBy/${setter.type}`](node, content, setter.name, setter.property)
        }
      }
    },
    '_insert/append' (target, source) {
      target.appendChild(source)
    },
    '_insert/after' (target, source) {
      target.after(source)
    },
    '_insert/before' (target, source) {
      target.before(source)
    },
    '_insert/replace' (target, source) {
      target.replaceWith(source)
    },
    /**
     * Set attributes to element
     * @param {dsViewId} dsViewId - dsView node id
     * @param {Array.<string[]>} attributes
     * @private
     */
    _setAttributes (element, attributes) {
      for (let i = 0; i < attributes.length; i++) {
        const [name, value] = attributes[i]

        element.setAttribute(name, value)
      }
    },
    /**
     * Set element value using a attribute
     * @param {Object} node - Text or Element node
     * @param {(string|Object)} content - dsContent object
     * @private
     */
    '_setValueBy/attribute' (node, content, name, property) {
      node.setAttribute(name, content[property])
    },
    /**
     * Set element value using a attribute
     * @param {Object} node - Text or Element node
     * @param {(string|Object)} content - dsContent object
     * @private
     */
    '_setValueBy/setter' (node, content, name, property) {
      if (node.__lookupSetter__(name)) {
        node[name] = content[property]
      }
    },
    '_setValueBy/token' (node, content, name, property, type, dsViewId) {
      this.$method('dsToken/textContent', {
        dsViewId,
        text: content[property],
        updateText: (value) => {
          content[property] = value
          this['_setValueBy/' + type](node, content[property], name, property)
        }
      })
    },
    /**
     * Unmount node
     * @param {dsViewId} dsViewId - dsView node id
     * @private
     */
    _unmount (dsViewId) {
      this.$emit('dsView/unmount', {
        id: dsViewId,
        context: { dsViewId }
      })

      this.$deleteDataValue('dsView/itemParent', dsViewId)
    }
  }
})

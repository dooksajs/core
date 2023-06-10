/**
 * @typedef {string} dsViewId - dsView node id
 * @example <caption>Example of string value</caption>
 * "_v53KKewgkeUQuwDXUnlArp_0000"
 */

/**
 * @namespace dsView
 */
export default {
  name: 'dsView',
  version: 1,
  data: {
    rootViewId: {
      default: 'app-' + Math.random().toString().substring(2),
      schema: {
        type: 'string'
      }
    },
    attributes: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    },
    content: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsContent/items'
        }
      }
    },
    handlers: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array'
        }
      }
    },
    items: {
      default: {},
      schema: {
        type: 'collection',
        mutable: true,
        items: {
          type: 'node'
        }
      }
    },
    itemParent: {
      default: {},
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
   * @param {string} options.rootElementId - Root element id
   */
  setup ({ rootElementId = 'root' }) {
    // get root element from the DOM
    const rootElement = document.getElementById(rootElementId)

    if (!rootElement) {
      throw new Error('Could not find root element: ', rootElement)
    }

    const rootViewId = this.$getDataValue({ name: 'dsView/rootViewId' })

    // Set root element
    this.createElement({
      dsViewId: rootViewId.item,
      dsComponent: {
        id: 'div'
      }
    })

    // get root element
    const dsView = this.$getDataValue({
      name: 'dsView/items',
      id: rootViewId.item
    })

    // replace root element with new app element
    rootElement.parentElement.replaceChild(dsView.item, rootElement)
  },
  /** @lends dsView.prototype */
  methods: {
    /**
     * Adds a node to the end of the list of children of a specified parent node
     * @param {Object} item
     * @param {dsViewId} item.dsViewId - Child dsView node id
     * @param {dsViewId} item.dsViewParentId - Parent dsView node id
     */
    append ({ dsViewId, dsViewParentId }) {
      const parentView = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewParentId
      })
      const childView = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewId
      })

      parentView.item.appendChild(childView.item)

      this.$emit({
        name: 'dsView/mount',
        id: dsViewId,
        payload: {
          dsViewParentId,
          dsViewId
        }
      })

      this.$addDataListener({
        name: 'dsView/items',
        on: 'delete',
        id: dsViewId,
        refId: dsViewId,
        listener: () => {
          this.$deleteDataValue({
            name: 'dsView/items',
            id: dsViewId
          })
        }
      })

      // update parents
      this.$setDataValue({
        name: 'dsView/itemParent',
        source: dsViewParentId,
        options: {
          id: dsViewId
        }
      })
    },
    /**
     * Creates element
     * @param {Object} item
     * @param {dsViewId} item.dsViewId - dsView node id
     * @param {dsComponent} item.dsComponent - Component from dsComponent
     * @param {string} item.dsWidgetSectionId - Section id from dsWidget
     * @param {string} item.dsWidgetInstanceId - Instance id from dsWidget
     */
    createElement ({ dsViewId, dsComponent, dsWidgetSectionId, dsWidgetInstanceId }) {
      const element = document.createElement(dsComponent.id)
      // ISSUE: [DS-758] Remove dev code during build (using rollup)
      // Add view node id to the node
      if (this.isDev) {
        element.id = dsViewId
      }

      element.dsViewId = dsViewId

      this.$setDataValue({
        name: 'dsView/items',
        source: element,
        options: {
          id: dsViewId
        }
      })

      if (dsComponent.attributes) {
        this._setAttributes(element, dsComponent.attributes)
      }

      const component = this.$component(element.tagName.toLowerCase())

      // ISSUE: [DS-889] Only add events if in edit mode
      if (component && component.events) {
        for (let i = 0; i < component.events.length; i++) {
          const name = component.events[i]

          const handler = (event) => {
            const dsContentId = this.$getDataValue({
              name: 'dsView/content',
              id: dsViewId
            })

            this.$emit({
              name,
              id: dsViewId,
              payload: {
                dsViewId,
                dsContentId: dsContentId.item,
                dsWidgetInstanceId,
                dsWidgetSectionId,
                event
              }
            })
          }

          element.addEventListener(name, handler)

          this.$setDataValue({
            name: 'dsView/handlers',
            source: handler,
            options: {
              id: dsViewId,
              source: {
                push: true
              }
            }
          })
        }
      }
    },
    /**
     * Creates text nodes
     * @param {dsViewId} dsViewId - dsView node id
     */
    createNode (dsViewId) {
      const textNode = document.createTextNode('')

      textNode.dsViewId = dsViewId

      this.$setDataValue({
        name: 'dsView/items',
        source: textNode,
        options: {
          id: dsViewId
        }
      })
    },
    /**
     * Get value from node item
     * @param {dsViewId} dsViewId - dsView node id
     * @returns {string|Object} - Either a string or Object based on the components getter
     */
    getValue (dsViewId) {
      const dsView = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewId
      })

      if (dsView.isEmpty) {
        throw Error('No view item found')
      }

      const nodeName = dsView.item.nodeName.toLowerCase()
      const dsComponent = this.$component(nodeName)

      if (dsComponent && dsComponent.get) {
        if (dsComponent.get.type) {
          return this[`_getValueBy/${dsComponent.get.type}`](dsView.item, dsComponent.get.value)
        }

        let value

        for (let i = 0; i < dsComponent.getter.length; i++) {
          const getter = dsComponent.get[i]
          const newValue = this[`_getValueBy/${getter.type}`](dsView.item, getter.value)

          value = { ...value, ...newValue }
        }

        return value
      }
    },
    /**
     * Remove node
     * @param {dsViewId} dsViewId - dsView node id
     */
    remove (dsViewId) {
      const dsView = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewId
      })

      if (!dsView.isEmpty) {
        // remove content attachment
        this._unmount(dsViewId)
        this._removeHanders(dsViewId)

        dsView.item.remove()
      }
    },
    /**
     * Remove all child nodes from select node
     * @param {dsViewId} dsViewId - dsView node id
     */
    removeChildren (dsViewId) {
      const dsView = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewId
      })

      if (!dsView.isEmpty && dsView.item.lastChild) {
        const node = dsView.item

        while (node.lastChild) {
          this._unmount(node.lastChild.dsViewId)
          this._removeHanders(node.lastChild.dsViewId)

          node.removeChild(node.lastChild)
        }

        this.$emit({
          name: 'dsView/unmount',
          id: dsViewId,
          payload: { dsViewId }
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
      const dsViewChild = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewId
      })

      let dsViewPrevChild, dsViewParent

      if (dsViewIdPrev) {
        dsViewPrevChild = this.$getDataValue({
          name: 'dsView/items',
          id: dsViewIdPrev
        })
        dsViewParent = dsViewPrevChild.item.parentElement
      } else if (!isNaN(childIndex)) {
        dsViewParent = this.$getDataValue({
          name: 'dsView/items',
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
        this.$emit({
          name: 'dsView/mount',
          id: dsViewId,
          payload: { dsViewId }
        })

        // update parents
        this.$setDataValue({
          name: 'dsView/itemParent',
          source: dsViewParent.item.dsViewId,
          options: {
            id: dsViewId
          }
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
      const dsView = this.$getDataValue({
        name: 'dsView/items',
        id: dsViewId
      })

      if (dsView.isEmpty) {
        throw Error('No view item found')
      }

      let dsContentId = this.$getDataValue({
        name: 'dsView/content',
        id: dsViewId
      })

      if (dsContentId.isEmpty) {
        throw Error('No content attached to view item')
      }

      dsContentId = dsContentId.item

      let dsContent = this.$getDataValue({
        name: 'dsContent/items',
        id: dsContentId
      })

      // exit if content is empty
      if (dsContent.isEmpty) {
        return
      }

      dsContent = dsContent.item

      const dsContentType = this.$getDataValue({
        name: 'dsContent/type',
        id: dsContentId
      })
      const node = dsView.item
      const nodeName = node.nodeName.toLowerCase()

      // ISSUE: [DS-760] move setters to general actions
      if (dsContentType.item.name === 'text') {
        if (dsContent.token) {
          return this.$method('dsToken/textContent', {
            dsViewId,
            text: dsContent.value,
            updateText: (value) => {
              node.textContent = value
            }
          })
        }

        node.textContent = dsContent.value

        return
      }

      const dsComponent = this.$component(nodeName)

      if (dsComponent && dsComponent.set) {
        if (dsComponent.set.type) {
          return this[`_setValueBy/${dsComponent.set.type}`](node, dsComponent.set.value, dsContent.value)
        }

        for (let i = 0; i < dsComponent.set.length; i++) {
          const setter = dsComponent.set[i]

          this[`_setValueBy/${setter.type}`](node, setter.value, dsContent.value)
        }
      }
    },
    /**
     * Get value from element it's attribute
     * @param {Object} node - Element
     * @param {dsComponentGet} getter - Getters used to fetch the value from the element
     * @returns {string}
     * @private
     */
    '_getValueBy/attribute' (element, getter) {
      if (typeof getter === 'string') {
        return element.getAttribute(getter)
      }

      const value = {}

      for (let i = 0; i < getter.length; i++) {
        const { name, key } = getter[i]

        value[key] = element.getAttribute(name)
      }

      return value
    },
    /**
     * Get value from element using a getter
     * @param {Object} node - Text or Element node
     * @param {dsComponentGet} getter - Getters used to fetch the value from the element
     * @returns {string}
     * @private
     */
    '_getValueBy/getter' (node, getter) {
      if (typeof getter === 'string') {
        if (node.__lookupGetter__(getter)) {
          return node[getter]
        } else {
          return ''
        }
      } else {
        const value = {}

        for (let i = 0; i < getter.length; i++) {
          const { name, key } = getter[i]

          if (node.__lookupGetter__(getter)) {
            value[key] = node[name]
          } else {
            value[key] = ''
          }
        }

        return value
      }
    },
    /**
     * Remove event handlers
     * @param {dsViewId} id - handler ref id
     * @private
     */
    _removeHanders (dsViewId) {
      delete this.handlers[dsViewId]
    },
    /**
     * Set attributes to element
     * @param {dsViewId} dsViewId - dsView node id
     * @param {Object.<string, string>} attributes
     * @private
     */
    _setAttributes (element, attributes) {
      for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
          // check if setter exists on element
          element.setAttribute(key, attributes[key])
        }
      }
    },
    /**
     * Set event handler
     * @param {string} dsViewId - handler ref id
     * @param {function} handler - handler for an event
     * @private
     */
    _setHandler (dsViewId, handler) {
      if (this.handlers[dsViewId]) {
        this.handlers[dsViewId].push(handler)
      } else {
        this.handlers[dsViewId] = [handler]
      }
    },
    /**
     * Set element value using a attribute
     * @param {Object} node - Text or Element node
     * @param {dsComponentSet} setter - Setters used to update the elements value
     * @param {(string|Object)} value
     * @private
     */
    '_setValueBy/attribute' (node, setter, value) {
      if (typeof setter === 'string') {
        return node.setAttribute(setter, value)
      }

      for (let i = 0; i < setter.length; i++) {
        const { name, key } = setter[i]

        node.setAttribute(name, value[key])
      }
    },
    /**
     * Set element value using a attribute
     * @param {Object} node - Text or Element node
     * @param {dsComponentSet} setter - Setters used to update the elements value
     * @param {(string|Object)} value
     * @private
     */
    '_setValueBy/setter' (node, setter, value) {
      if (typeof setter === 'string') {
        if (node.__lookupSetter__(setter)) {
          node[setter] = value
        }
      } else {
        for (let i = 0; i < setter.length; i++) {
          const { name, key } = setter[i]

          if (node.__lookupSetter__(name)) {
            node[name] = value[key]
          }
        }
      }
    },
    /**
     * Unmount node
     * @param {dsViewId} dsViewId - dsView node id
     * @private
     */
    _unmount (dsViewId) {
      this.$emit({
        name: 'dsView/unmount',
        id: dsViewId,
        payload: { dsViewId }
      })

      this.$removeDataValue({
        name: 'dsView/itemParent',
        id: dsViewId
      })
    }
  }
}

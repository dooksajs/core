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
    rootViewId: '',
    attributes: {},
    content: {},
    handlers: {},
    nodes: {},
    parentNode: {}
  },
  /**
   * Setup plugin
   * @param {Object} options
   * @param {string} options.rootElementId - Root element id
   * @memberof dsView
   * @inner
   */
  setup ({ rootElementId = 'root' }) {
    // get root element from the DOM
    const rootElement = document.getElementById(rootElementId)

    if (!rootElement) {
      throw new Error('Could not find root element: ', rootElement)
    }

    this.rootViewId = 'appElement'

    // Set root element
    this.createElement({
      dsViewId: this.rootViewId,
      dsComponent: {
        tag: 'div'
      }
    })

    // get root element
    const appElement = this.get(this.rootViewId)

    // replace root element with new app element
    rootElement.parentElement.replaceChild(appElement, rootElement)
  },
  /** @lends dsView */
  methods: {
    /**
     * Adds a node to the end of the list of children of a specified parent node
     * @param {Object} node
     * @param {dsViewId} node.dsViewParentId - Parent dsView node id
     * @param {dsViewId} node.dsViewId - Child dsView node id
     */
    append ({ dsViewId, dsViewParentId }) {
      const parent = this.get(dsViewParentId)
      const child = this.get(dsViewId)

      parent.appendChild(child)

      this.$method('dsEvent/emit', {
        dsEventId: dsViewId,
        dsEventOn: 'dsView/mount',
        payload: {
          dsViewParentId,
          dsViewId
        }
      })

      // update parents
      this._setParent(dsViewId, dsViewParentId)
    },
    /**
     * Attach content id to a node
     * @param {Object} param
     * @param {dsViewId} param.dsViewId - dsView node id
     * @param {dsContentId} param.dsContentId - dsContent id
     */
    attachContent ({ dsViewId, dsContentId }) {
      this.content[dsViewId] = dsContentId
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
      const element = document.createElement(dsComponent.tag)
      // ISSUE: [DS-758] Remove dev code during build (using rollup)
      // Add view node id to the node
      if (this.isDev) {
        element.id = dsViewId
      }

      element.dsViewId = dsViewId

      this._set(dsViewId, element)

      if (dsComponent.attributes) {
        this._setAttributes(dsViewId, dsComponent.attributes)
      }

      const component = this.$component(element.tagName.toLowerCase())

      if (component && component.events) {
        for (let i = 0; i < component.events.length; i++) {
          const on = component.events[i]

          const handler = (event) => {
            this.$method('dsEvent/emit', {
              dsEventId: dsViewId,
              dsEventOn: on,
              payload: {
                dsViewId,
                dsContentId: this._getContent(dsViewId),
                dsWidgetInstanceId,
                dsWidgetSectionId,
                event
              }
            })
          }

          element.addEventListener(on, handler)

          this._setHander(dsViewId, handler)
        }
      }
    },
    /**
     * Creates text nodes
     * @param {dsViewId} id - Node id
     */
    createNode (dsViewId) {
      const textNode = document.createTextNode('')

      textNode.dsViewId = dsViewId

      this._set(dsViewId, textNode)
    },
    /**
     * Get Text or Element
     * @param {dsViewId} dsViewId - dsView node id
     * @returns {Object} - [Text node]{@link https://developer.mozilla.org/en-US/docs/Web/API/Text} or [Element]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element}
     */
    get (dsViewId) {
      return this.nodes[dsViewId]
    },
    /**
     * Get the parent node
     * @param {dsViewId} dsViewId - dsView node id
     * @returns {Object} - [Text node]{@link https://developer.mozilla.org/en-US/docs/Web/API/Text} or [Element]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element}
     */
    getParent (dsViewId) {
      return this.parentNode[dsViewId]
    },
    /**
     * Get value from node item
     * @param {dsViewId} dsViewId - dsView node id
     * @returns {string|Object} - Either a string or Object based on the components getter
     */
    getValue (dsViewId) {
      const node = this.get(dsViewId)
      const nodeName = node.nodeName.toLowerCase()
      const dsComponent = this.$component(nodeName)

      if (dsComponent && dsComponent.get) {
        if (dsComponent.get.type) {
          return this[`_getValueBy/${dsComponent.get.type}`](node, dsComponent.get.value)
        }

        let value

        for (let i = 0; i < dsComponent.getter.length; i++) {
          const getter = dsComponent.get[i]
          const newValue = this[`_getValueBy/${getter.type}`](node, getter.value)

          value = { ...value, ...newValue }
        }

        return value
      }
    },
    /**
     * Returns root viewId
     * @returns {dsViewId} Root element Id
     */
    getRootViewId () {
      return this.rootViewId
    },
    /**
     * Remove node
     * @param {dsViewId} dsViewId - dsView node id
     */
    remove (dsViewId) {
      const node = this.get(dsViewId)

      if (node) {
        // remove content attachment
        delete this.content[dsViewId]

        this._unmount(dsViewId)
        this._removeHanders(dsViewId)

        node.remove()
      }
    },
    /**
     * Remove all child nodes from select node
     * @param {dsViewId} dsViewId - dsView node id
     */
    removeChildren (dsViewId) {
      const element = this.get(dsViewId)

      if (element && element.lastChild) {
        while (element.lastChild) {
          this._unmount(element.lastChild.dsViewId)
          this._removeHanders(element.lastChild.dsViewId)

          element.removeChild(element.lastChild)
        }

        this.$method('dsEvent/emit', {
          dsEventId: dsViewId,
          dsEventOn: 'dsView/removeChildren',
          payload: { dsViewId }
        })
      }
    },
    /**
     * Replaces a child node within the given (parent) node
     * @param {Object} node
     * @param {dsViewId} node.dsViewParentId - Parent dsView node id
     * @param {dsViewId} node.dsViewId - Child dsView node id
     * @param {dsViewId} node.prevDsViewId - Replacement child dsView node id
     * @param {number} node.childIndex - Index of replacement child
     */
    replace ({ dsViewParentId, dsViewId, prevDsViewId, childIndex }) {
      const child = this.get(dsViewId)
      let oldChild, parent

      if (prevDsViewId) {
        oldChild = this.get(prevDsViewId)
        parent = oldChild.parentElement
      } else if (!isNaN(childIndex)) {
        parent = this.get(dsViewParentId)

        oldChild = parent.childNodes[childIndex]
      }

      // replace old child with new child
      if (oldChild) {
        oldChild.replaceWidth(child)

        // emit old child unmount
        this._unmount(oldChild.dsViewId)

        // emit new child mount
        this.$method('dsEvent/emit', {
          dsEventId: dsViewId,
          dsEventOn: 'dsView/mount',
          payload: {
            dsViewId
          }
        })

        // update parents
        this._setParent(dsViewId, parent.dsViewId)
      }
    },
    /**
     * Update node value
     * @param {Object} node
     * @param {dsViewId} node.dsViewId - dsView node id
     * @param {dsContentValue} node.value - dsContent value
     * @param {dsContentLanguage} node.language - dsContent language code
     */
    updateValue ({ dsViewId, dsContentId, language }) {
      const node = this.get(dsViewId)
      const nodeName = node.nodeName.toLowerCase()
      const dsContentValue = this.$method('dsContent/getValue', { dsContentId })

      // ISSUE: [DS-760] move setters to general actions
      if (nodeName === '#text') {
        if (dsContentValue.token) {
          return this.$method('dsToken/textContent', {
            instanceId: dsViewId,
            text: dsContentValue.text,
            updateText: (value) => {
              node.textContent = value
            }
          })
        }

        node.textContent = dsContentValue.text

        return
      }

      const dsComponent = this.$component(nodeName)

      if (dsComponent && dsComponent.setter) {
        if (dsComponent.setter.type) {
          return this[`_setValueBy/${dsComponent.setter.type}`](node, dsComponent.setter.value, dsContentValue)
        }

        for (let i = 0; i < dsComponent.setter.length; i++) {
          const setter = dsComponent.setter[i]

          this[`_setValueBy/${setter.type}`](node, setter.value, dsContentValue)
        }
      }
    },
    /**
     * Get content attached to node
     * @param {dsViewId} dsViewId - dsView node id
     * @returns {dsContentId}
     * @private
     */
    _getContent (dsViewId) {
      return this.content[dsViewId]
    },
    /**
     * Get value from element it's attribute
     * @param {Object} node - Element
     * @param {dsPluginComponentGet} getter - Getters used to fetch the value from the element
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
     * @param {dsPluginComponentGet} getter - Getters used to fetch the value from the element
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
     * Sets parent node to select node
     * @param {dsViewId} dsViewId - select dsView node id
     * @param {Object} node - DOM node
     * @private
     */
    _set (dsViewId, node) {
      this.nodes[dsViewId] = node
    },
    /**
     * Set attributes to element
     * @param {dsViewId} dsViewId - dsView node id
     * @param {Object.<string, string>} attributes
     * @private
     */
    _setAttributes (dsViewId, attributes) {
      const element = this.get(dsViewId)

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
    _setHander (dsViewId, handler) {
      if (this.handlers[dsViewId]) {
        this.handlers[dsViewId].push(handler)
      } else {
        this.handlers[dsViewId] = [handler]
      }
    },
    /**
     * Sets parent node to select node
     * @param {dsViewId} dsViewId - select dsView node id
     * @param {dsViewId} dsViewParentId - parent dsView node id
     * @private
     */
    _setParent (dsViewId, dsViewParentId) {
      this.parentNode[dsViewParentId] = dsViewId
    },
    /**
     * Set element value using a attribute
     * @param {Object} node - Text or Element node
     * @param {dsPluginComponentSet} setter - Setters used to update the elements value
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
     * @param {dsPluginComponentSet} setter - Setters used to update the elements value
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
      this.$method('dsEvent/emit', {
        dsEventId: dsViewId,
        dsEventOn: 'dsView/unmount',
        payload: { dsViewId }
      })

      this._setParent(dsViewId, '')
    }
  }
}

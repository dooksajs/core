/* dsView */
// create
// this.$method('dsView/createNode', id)
// this.$method('dsView/createElement', { id, element, sectionId, instanceId })

// // get
// this.$method('dsView/get', id)
// this.$method('dsView/getValue', id)
// this.$method('dsView/getParent', id)

// // update
// this.$method('dsView/updateValue', { id, value, language = 'default' })
// this.$method('dsView/updateAttributes', { id, value })

// // append
// this.$method('dsView/append', { parentId, childId })
// this.$method('dsView/attachContent', { id, contentId, language = 'default' })

// // remove
// this.$method('dsView/detach', id)
// this.$method('dsView/detachChildren', id)
// this.$method('dsView/detachContent', { id, contentId, language = 'default' })

/**
 * @typedef {string} dsViewId - dsView node id
 * @example
 * '_v53KKewgkeUQuwDXUnlArp_0000'
 */

/**
 * @namespace dsView
 */
export default {
  name: 'dsView',
  version: 1,
  data: {
    nodes: {},
    parentNode: {}
  },
  /**
   * Setup plugin
   * @param {Object} options
   * @param {number} options.rootElementId - Root element id
   * @memberof dsView
   * @inner
   */
  setup ({ rootElementId = 'root' }) {
    // get root element from the DOM
    const rootElement = document.getElementById(rootElementId)

    if (!rootElement) {
      throw new Error('Could not find root element: ', rootElement)
    }

    // Set root element
    this.createElement({
      id: 'appElement',
      item: {
        tag: 'div'
      }
    })

    // get root element
    const appElement = this._getNode('appElement')

    // replace root element with new app element
    rootElement.parentElement.replaceChild(appElement, rootElement)
  },
  /** @lends dsView.prototype */
  methods: {
    /**
     * Adds a node to the end of the list of children of a specified parent node
     * @param {Object} node
     * @param {dsViewId} node.parentId - Parent dsView node id
     * @param {dsViewId} node.childId - Child dsView node id
     */
    append ({ parentId, childId }) {
      const parent = this._getNode(parentId)
      const child = this._getNode(childId)

      parent.appendChild(child)

      this.$method('dsEvent/emit', {
        namespace: 'dsView',
        id: childId,
        on: 'mount',
        payload: {
          parentElementId: parentId,
          elementId: childId
        }
      })

      // update parents
      this._setParent(childId, parentId)
    },
    /**
     * Creates element
     * @param {Object} item
     * @param {dsViewId} item.id - dsView node id
     * @param {Component} item.component - Component from dsComponent
     * @param {string} item.sectionId - Section id from dsWidget
     * @param {string} item.instanceId - Instance id from dsWidget
     */
    createElement ({ id, component, sectionId, instanceId }) {
      const element = document.createElement(component.tag)
      // ISSUE: [DS-758] Remove dev code during build (using rollup)
      // Add view node id to the node
      if (this.isDev) {
        element.id = id
      }

      element.dsViewId = id

      // Set dooksa data to element
      // ISSUE: [DS-745] Assigning dsMethod to elements is a security issue

      this._set(id, element)

      if (component.attributes) {
        this.updateAttributes(id, component.attributes)
      }

      const dsComponent = this.$component(element.tagName.toLowerCase())

      if (dsComponent && dsComponent.events) {
        for (let i = 0; i < dsComponent.events.length; i++) {
          const on = dsComponent.events[i]

          element.addEventListener(on, (event) => {
            const contentId = this._getElementContent(id)

            this.$method('dsEvent/emit', {
              namespace: 'dsView/node',
              id,
              on,
              payload: {
                elementId: id,
                contentId,
                instanceId,
                sectionId,
                event
              }
            })
          })
        }
      }
    },
    /**
     * Creates text nodes
     * @param {dsViewId} id - Node id
     */
    createNode (id) {
      const textNode = document.createTextNode('')

      textNode.dsViewId = id

      this._set(id, textNode)
    },
    /**
     * Get Text or Element
     * @param {dsViewId} id - dsView node id
     * @returns {Object} - [Text node]{@link https://developer.mozilla.org/en-US/docs/Web/API/Text} or [Element]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element}
     */
    get (id) {
      return this.nodes[id]
    },
    /**
     * Get the parent node
     * @param {dsViewId} id - dsView node id
     * @returns {Object} - [Text node]{@link https://developer.mozilla.org/en-US/docs/Web/API/Text} or [Element]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element}
     */
    getParent (id) {
      return this.parentNode[id]
    },
    /**
     * Get value from node item
     * @param {dsViewId} id - dsView node id
     * @returns {string|Object} - Either a string or Object based on the components getter
     */
    getValue (id) {
      const node = this.get(id)
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
     * Remove node
     * @param {dsViewId} id - dsView node id
     */
    remove (id) {
      const node = this.get(id)

      if (node) {
        this._unmount(id)

        node.remove()
      }
    },
    /**
     * Remove all child nodes from select node
     * @param {dsViewId} id - dsView node id
     */
    removeChildren (id) {
      const element = this.get(id)

      if (element && element.lastChild) {
        while (element.lastChild) {
          this._unmount(element.lastChild.dsViewId)

          element.removeChild(element.lastChild)
        }

        this.$method('dsEvent/emit', {
          namespace: 'dsView',
          id,
          on: 'removeChildren',
          payload: { id }
        })
      }
    },
    /**
     * Replaces a child node within the given (parent) node
     * @param {Object} node
     * @param {dsViewId} node.parentId - Parent dsView node id
     * @param {dsViewId} node.childId - Child dsView node id
     * @param {dsViewId} node.oldChildId - Replacement child dsView node id
     * @param {number} node.childIndex - Index of replacement child
     */
    replace ({ parentId, childId, oldChildId, childIndex }) {
      const child = this._getNode(childId)
      let oldChild, parent

      if (oldChildId) {
        oldChild = this._getNode(oldChildId)
        parent = oldChild.parentElement
      } else if (!isNaN(childIndex)) {
        parent = this._getNode(parentId)

        oldChild = parent.childNodes[childIndex]
      }

      // replace old child with new child
      if (oldChild) {
        oldChild.replaceWidth(child)

        // emit old child unmount
        this._unmount(oldChild.dsViewId)

        // emit new child mount
        this.$method('dsEvent/emit', {
          namespace: 'dsView',
          id: childId,
          on: 'mount',
          payload: {
            id: childId
          }
        })

        // update parents
        this._setParent(childId, parent.dsViewId)
      }
    },
    /**
     * Update node value
     * @param {Object} node
     * @param {dsViewId} node.id - dsView node id
     * @param {dsContentValue} node.value - dsContent value
     * @param {dsContentLanguage} node.language - dsContent language code
     */
    updateValue ({ id, value, language }) {
      const node = this.get(id)
      const nodeName = node.nodeName.toLowerCase()

      // ISSUE: [DS-760] move setters to general actions
      if (nodeName === '#text') {
        if (value.token) {
          return this.$method('dsToken/textContent', { instanceId: id, text: value.text, updateText: node.textContent })
        }

        node.textContent = value.text

        return
      }

      const dsComponent = this.$component(nodeName)

      if (dsComponent && dsComponent.setter) {
        if (dsComponent.setter.type) {
          return this[`_setValueBy/${dsComponent.setter.type}`](node, dsComponent.setter.value, value)
        }

        for (let i = 0; i < dsComponent.setter.length; i++) {
          const setter = dsComponent.setter[i]

          this[`_setValueBy/${setter.type}`](node, setter.value, value)
        }
      }
    },
    /**
     * Sets parent node to select node
     * @param {dsViewId} id - select dsView node id
     * @param {dsViewId} parentId - parent dsView node id
     * @private
     */
    _setParent (id, parentId) {
      this.parentNode[parentId] = id
    },
    /**
     * Unmount node
     * @param {dsViewId} id - dsView node id
     * @private
     */
    _unmount (id) {
      this.$method('dsEvent/emit', {
        namespace: 'dsView',
        id,
        on: 'unmount',
        payload: { id }
      })

      this._setParent(id, '')
    }
  }
}

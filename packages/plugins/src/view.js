import createPlugin from '@dooksa/create-plugin'
import { getNodeValue } from '@dooksa/utils'
import {
  dataGenerateId,
  dataUnsafeSetData,
  tokenTextContent,
  $getDataValue,
  $setDataValue,
  $deleteDataValue,
  $addDataListener,
  $component,
  $componentGetter,
  $componentSetter,
  $emit
} from './index.js'

const elementInsert = {
  append (target, source) {
    target.appendChild(source)
  },
  after (target, source) {
    target.after(source)
  },
  before (target, source) {
    target.before(source)
  },
  replace (target, source) {
    target.replaceWith(source)
  }
}

const setValueBy = {
  /**
   * Set element value using a attribute
   * @param {Object} node - Text or Element node
   * @param {(string|Object)} content - content object
   * @private
   */
  attribute (node, content, name, property) {
    node.setAttribute(name, content[property])
  },
  /**
   * Set element value using a attribute
   * @param {Object} node - Text or Element node
   * @param {(string|Object)} content - content object
   * @private
   */
  setter (node, content, name, property) {
    if (node.__lookupSetter__(name)) {
      node[name] = content[property]
    }
  },
  token (node, content, name, property, type, viewId) {
    tokenTextContent({
      viewId,
      text: content[property],
      updateText: (value) => {
        content[property] = value
        this[type](node, content[property], name, property)
      }
    })
  }
}


/**
   * Set attributes to element
   * @param {viewId} viewId - view node id
   * @param {Array.<string[]>} attributes
   * @private
   */
function setAttributes (element, attributes) {
  for (let i = 0; i < attributes.length; i++) {
    const [name, value] = attributes[i]

    element.setAttribute(name, value)
  }
}

/**
   * Unmount node
   * @param {viewId} viewId - view node id
   * @private
   */
function unmount (viewId) {
  $emit('view/unmount', {
    id: viewId,
    context: { viewId }
  })

  $deleteDataValue('view/items', viewId)
  $deleteDataValue('view/content', viewId)
}

function createNode ({
  viewId,
  componentId,
  sectionId,
  widgetId
}) {
  let componentItem = $getDataValue('component/items', {
    id: componentId
  }).item

  if (!componentItem) {
    return
  }

  viewId = viewId || dataGenerateId()
  let element

  if (componentItem.id === 'text') {
    element = document.createTextNode('')
  } else {
    element = document.createElement(componentItem.id)

    DEV: {
      element.dataset.viewId = viewId
      element.dataset.sectionId = sectionId
      element.dataset.widgetId = widgetId
      element.dataset.componentId = componentId
    }
  }

  element.viewId = viewId

  /** @ISSUE unsafe is used because the schema doesn't support nodes */
  dataUnsafeSetData({
    name: 'view/items',
    data: element,
    options: {
      id: viewId
    }
  })

  if (componentItem.attributes) {
    setAttributes(element, componentItem.attributes)
  }

  const component = $component(componentItem.id)

  // ISSUE: [DS-889] Only add events if in edit mode
  if (component && component.events) {
    for (let i = 0; i < component.events.length; i++) {
      const event = component.events[i]
      const name = event.name || event

      const handler = (e) => {
        e.preventDefault()
        const viewContent = $getDataValue('view/content', {
          id: viewId
        })

        if (event.syncContent) {
          const value = this.getValue({ id: viewId })

          $setDataValue('content/items', value, { id: viewContent.item })
        }

        $emit(name, {
          id: viewId,
          context: {
            viewId,
            contentId: viewContent.item,
            widgetId,
            event
          }
        })
      }

      element.addEventListener(name, handler)

      $setDataValue('event/handlers', handler, {
        id: viewId,
        update: {
          method: 'push'
        }
      })
    }
  }

  return viewId
}

const view = createPlugin({
  name: 'view',
  models: {
    rootViewId: {
      type: 'string'
    },
    content: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'content/items'
      }
    },
    items: {
      type: 'collection',
      items: {
        type: 'node'
      }
    }
  },
  actions: {
    /**
     * Adds a node to the end of the list of children of a specified parent node
     * @param {Object} item
     * @param {viewId} item.targetId - parentViewId view node id
     * @param {viewId} item.sourceId - Child view node id
     * @param {string} item.widgetId - Widget id
     * @param {string} item.widgetMode - Widget mode
     * @param {'append'|'after'|'before'|"replace"} [item.type] - type of insert method
     */
    insert ({ targetId, sourceId, widgetId, widgetMode, type = 'append' }) {
      const target = $getDataValue('view/items', {
        id: targetId
      })
      const source = $getDataValue('view/items', {
        id: sourceId
      })
      // attach node to target node
      elementInsert[type](target.item, source.item)

      $emit('view/mount', {
        id: sourceId,
        context: {
          viewIdParent: targetId,
          viewId: sourceId,
          widgetId,
          widgetMode
        }
      })

      $addDataListener('view/items', {
        on: 'delete',
        id: sourceId,
        handler: {
          id: sourceId,
          value: () => {
            $deleteDataValue('view/items', sourceId)
          }
        }
      })
    },
    /**
     * Creates node
     * @param {Object} item
     * @param {string} item.viewId - View id
     * @param {string} item.componentId - Component id
     * @param {string} item.sectionId - Section id from widget
     * @param {string} item.widgetId - Instance id from widget
     */
    createNode,
    detach ({ id }) {
      const view = $getDataValue('view/items', { id })

      if (!view.isEmpty) {
        unmount(id)

        view.item.remove()
      }
    },
    /**
     * Get value from node item
     * @param {viewId} viewId - view node id
     * @returns {string|Object} - Either a string or Object based on the components getter
     */
    getValue ({ id }) {
      const view = $getDataValue('view/items', {
        id
      })

      if (view.isEmpty) {
        throw Error('No view item found')
      }

      const nodeName = view.item.nodeName.toLowerCase()
      const getters = $componentGetter(nodeName)

      if (getters) {
        const node = view.item
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
     * @param {object} param - view node id
     * @param {string} param.id - view node id
     */
    remove ({ id }) {
      const view = $getDataValue('view/items', { id })

      if (!view.isEmpty) {
        // remove from DOM
        view.item.remove()

        $deleteDataValue('event/handlers', id)

        // remove content attachment
        unmount(id)
      }
    },
    /**
     * Remove all child nodes from select node
     * @param {string} viewId - view node id
     */
    removeChildren (viewId) {
      const view = $getDataValue('view/items', {
        id: viewId
      })

      if (!view.isEmpty && view.item.lastChild) {
        const node = view.item

        while (node.lastChild) {
          unmount(node.lastChild.viewId)
          node.removeChild(node.lastChild)
        }

        $emit('view/unmount', {
          id: viewId,
          context: { viewId }
        })
      }
    },
    /**
     * Replaces a child node within the given (parent) node
     * @param {Object} node
     * @param {string} node.viewParentId - Parent view id
     * @param {string} node.viewId - Child view id
     * @param {string} node.viewIdPrev - Replacement child view id
     * @param {number} node.childIndex - Index of replacement child
     */
    replace ({ viewParentId, viewId, viewIdPrev, childIndex }) {
      const viewChild = $getDataValue('view/items', {
        id: viewId
      })

      let viewPrevChild, viewParent

      if (viewIdPrev) {
        viewPrevChild = $getDataValue('view/items', {
          id: viewIdPrev
        })
        viewParent = viewPrevChild.item.parentElement
      } else if (!isNaN(childIndex)) {
        viewParent = $getDataValue('view/items', {
          id: viewParentId
        })

        viewPrevChild = viewParent.item.childNodes[childIndex]
      }

      // replace old child with new child
      if (viewPrevChild) {
        viewPrevChild.item.replaceWidth(viewChild.item)

        // emit old child unmount
        unmount(viewPrevChild.item.viewId)
      }
    },
    /**
     * Update node value
     * @param {Object} node
     * @param {string} node.viewId - view node id
     * @param {string} node.language - content language code
     */
    updateValue ({ viewId, language }) {
      const view = $getDataValue('view/items', {
        id: viewId
      })

      if (view.isEmpty) {
        throw Error('No view item found')
      }

      let contentId = $getDataValue('view/content', {
        id: viewId
      })

      if (contentId.isEmpty) {
        throw Error('No content attached to view item')
      }

      contentId = contentId.item

      const content = $getDataValue('content/items', {
        id: contentId
      })

      // exit if content is empty
      if (content.isEmpty) {
        return
      }

      const node = view.item
      const nodeName = node.nodeName.toLowerCase()
      $component(nodeName)
      const setters = $componentSetter(nodeName)

      if (setters) {
        for (let i = 0; i < setters.length; i++) {
          const setter = setters[i]
          const values = content.item.values

          if (setter.token && content.item.tokens[setter.property]) {
            setValueBy.token(node, values, setter.name, setter.property, setter.type, viewId)

            continue
          }

          setValueBy[setter.type](node, values, setter.name, setter.property)
        }
      }
    },
    /**
     * Remove attribute to element
     * @param {Object} param
     * @param {string} param.viewId - Element id
     * @param {string} param.name - Attribute name
     * @param {string} param.value - Attribute value
     */
    removeAttribute ({ viewId, name, value }) {
      const view = $getDataValue('view/items', {
        id: viewId
      })

      if (!view.isEmpty) {
        view.item.removeAttribute(name, value)
      }
    },
    /**
     * Set attribute to element
     * @param {Object} param
     * @param {string} param.viewId - Element id
     * @param {string} param.name - Attribute name
     * @param {string} param.value - Attribute value
     */
    setAttribute ({ viewId, name, value }) {
      const view = $getDataValue('view/items', {
        id: viewId
      })

      if (!view.isEmpty) {
        view.item.setAttribute(name, value)
      }
    }
  },
  setup ({ rootElementId = 'root' } = {}) {
    // get root element from the DOM
    const rootElement = document.getElementById(rootElementId)

    if (!rootElement) {
      throw new Error('Could not find root element: ' + rootElement)
    }

    // Set root element
    const viewId = createNode({
      viewId: rootElementId,
      componentId: '43f4f4c34d66e648',
      sectionId: rootElementId,
      widgetId: rootElementId
    })

    $setDataValue('view/rootViewId', viewId)

    // get root element
    const view = $getDataValue('view/items', {
      id: viewId
    })

    // replace root element with new app element
    rootElement.parentElement.replaceChild(view.item, rootElement)
  }
})

const viewInsert = view.actions.insert
const viewCreateNode = view.actions.createNode
const viewDetach = view.actions.detach
const viewGetValue = view.actions.getValue
const viewRemove = view.actions.remove
const viewRemoveChildren = view.actions.removeChildren
const viewReplace = view.actions.replace
const viewUpdateValue = view.actions.updateValue
const viewRemoveAttribute = view.actions.removeAttribute
const viewSetAttribute = view.actions.setAttribute

export {
  viewInsert,
  viewCreateNode,
  viewDetach,
  viewGetValue,
  viewRemove,
  viewRemoveAttribute,
  viewRemoveChildren,
  viewReplace,
  viewUpdateValue,
  viewSetAttribute
}

export default view

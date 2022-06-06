/**
 * Dooksa layout tools.
 * @module plugin
 */
export default {
  name: 'dsLayout',
  version: 1,
  data: {
    metadata: {
      _BIAklh1FkBmDPibBeDyvlg: {
        title: 'Image',
        content: {
          image: 1
        }
      },
      _H2e4SzLZHVwebhHxkUbSlw: {
        title: 'Two sections',
        content: {
          section: 2
        }
      }
    },
    items: {
      _BIAklh1FkBmDPibBeDyvlg: [
        {
          children: [1],
          componentId: '_wcx_d77j_LAySA_zzdfPep'
        },
        {
          parentIndex: 0,
          componentId: '_wcx_d77j_LAySA_zzdfPew',
          contentIndex: 0
        }
      ],
      _H2e4SzLZHVwebhHxkUbSlw: [
        {
          contentIndex: 0
        }
      ]
    },
    head: {},
    elements: {},
    modifiers: {}
  },
  methods: {
    getElements (context, { id, sectionId, instanceId, prefixId, lang = 'default', view = 'default', parentElementId = 'appElement' }) {
      let elements = this._getElement(instanceId) || []

      if (!elements.length) {
        const items = this._getItem(id)
        const head = this._getHead(id)

        elements = this._render(id, items, head, items, sectionId, instanceId, parentElementId, prefixId, lang, view)

        this._setElement(instanceId, elements)
      }

      return elements
    },
    setHead (context, head) {
      this.head = Object.assign(head, this.head)
    },
    setItems (context, items) {
      this.items = Object.assign(items, this.items)
    },
    setModifiers (context, items) {
      this.modifiers = { ...this.modifiers, ...items }
    },
    _getElement (id) {
      return this.elements[id]
    },
    _getHead (id) {
      return this.head[id] || [0]
    },
    _getItem (id) {
      return this.items[id]
    },
    _setElement (id, item) {
      this.elements[id] = item
    },
    _render (id, items, head, children, sectionId, instanceId, parentElementId, prefixId, lang, view, elements = [], elementChildren, currentIndex = 0) {
      // elements might make this variable redundant
      // position of elements within the layout
      let fragments = []

      if (!elements.length) {
        for (let i = 0; i < items.length; i++) {
          elements.push(instanceId + '$' + i)
        }

        elementChildren = elements
      }

      for (let i = 0; i < head.length; i++) {
        const item = children[head[i]]
        const elementId = elementChildren[head[i]]
        // add element Id
        const fragment = { id: elementId }

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          fragment.parentIndex = item.parentIndex
        }

        if (item.componentId) {
          const modifierId = this.$method('dsWidget/getLayout', sectionId + instanceId + '_' + view)
          const payload = {
            id: item.componentId
          }

          if (this.modifiers[modifierId] && this.modifiers[modifierId][currentIndex]) {
            payload.modifierId = this.modifiers[modifierId][currentIndex]
          }

          const component = this.$method('dsComponent/getItem', payload)

          // create parent component
          this.$method('dsElement/create' + component.type, { id: elementId, item: component })

          fragments.push(fragment)
        } else {
          fragment.id = parentElementId
        }

        if (item.children) {
          const sibling = this._getSibling(items, item.children, elements)
          const result = this._render(
            id,
            items,
            sibling.head,
            sibling.children,
            sectionId,
            instanceId,
            parentElementId,
            prefixId,
            lang,
            view,
            elements,
            sibling.elements,
            ++currentIndex
          )

          if (Object.hasOwnProperty.call(item, 'contentIndex')) {
            const contentId = this.$method('dsWidget/getContentItem', {
              id: sectionId,
              instanceId,
              prefixId,
              index: item.contentIndex
            })
            // this fragment contains content
            fragment.contentIndex = item.contentIndex

            this.$method('dsElement/attachContent', { contentId, elementId: fragment.id, lang })
            this.$method('dsWidget/attachItem', { type: 'content', id: contentId })
          }

          fragments = fragments.concat(result)
        } else if (Object.hasOwnProperty.call(item, 'contentIndex')) {
          const contentId = this.$method('dsWidget/getContentItem', {
            id: sectionId,
            instanceId,
            prefixId,
            index: item.contentIndex
          })
          // mark fragment has content
          fragment.contentIndex = item.contentIndex

          const contentType = this.$method('dsElement/getType', contentId)

          if (contentType === 'section') {
            const sectionId = this.$method('dsElement/getValue', { id: contentId })
            // create a new widget and append it to this element item
            this.$method('dsWidget/create', {
              id: sectionId,
              parentElementId: fragment.id,
              prefixId,
              lang,
              view
            })
          } else {
            // missing parentElement
            this.$method('dsElement/attachContent', { contentId, elementId: fragment.id, lang })
          }

          this.$method('dsWidget/attachItem', { type: 'content', id: contentId })
        }

        currentIndex++
      }

      return fragments
    },
    _getSibling (items, indexes, elements) {
      const newItems = {
        head: [],
        children: [],
        elements: []
      }

      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i]

        newItems.elements.push(elements[index])
        newItems.children.push(items[index])
        newItems.head.push(i)
      }

      return newItems
    }
  }
}

/**
 * Dooksa widget plugin.
 * @module plugin
 */
export default {
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsElement',
      version: 1
    }
  ],
  data: {
    items: {},
    content: {},
    loaded: {},
    view: {
      _ZPhyHOc6A3HwPrLMH3b1Yn: 'edit'
    },
    templates: {},
    layout: {},
    attached: {
      section: {},
      instance: {},
      content: {}
    },
    render: {
      section: {},
      instance: {},
      content: []
    }
  },
  methods: {
    create (context, { id, parentElementId, prefixId, lang }) {
      const [items, currentId] = this._getItem(id, prefixId)
      const view = this._getView(id)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const layout = item.layout[view]
        const itemId = currentId + item.instanceId + '_' + view

        if (!this.loaded[itemId]) {
          const content = this._getContent(prefixId)
          const defaultContent = content[itemId] || content[currentId + item.instanceId + '_default'] || []
          const modifiers = this.templates[layout.modifierId]

          this.$method('dsTemplate/create', {
            id: layout.templateId,
            sectionId: id,
            instanceId: item.instanceId,
            groupId: item.groupId,
            defaultContent,
            modifiers,
            view,
            head: true
          })
        }

        this._createInstance(currentId, item.instanceId, parentElementId, layout, prefixId, lang, view)
      }

      this.attachItem({}, { type: 'section', id: currentId })
    },
    _getView (id) {
      return this.view[id] || 'default'
    },
    setLayout (context, item) {
      this.layout = { ...this.layout, ...item }
    },
    getLayout (context, id) {
      return this.layout[id]
    },
    set (context, { pageId, payload }) {
      if (payload.items) {
        this.setItems({}, payload.items)
      }

      if (payload.content) {
        this.setContent({}, { id: pageId, items: payload.content })
      }

      if (payload.loaded) {
        this.loaded = { ...this.loaded, ...payload.loaded }
      }

      if (payload.layout) {
        this.layout = { ...this.layout, ...payload.layout }
      }

      if (payload.templates) {
        this.templates = { ...this.templates, ...payload.templates }
      }
    },
    setLoaded (context, { id, value }) {
      this.loaded[id] = value
    },
    _createInstance (id, instanceId, parentElementId, layout, prefixId, lang, view) {
      const elements = this.$method('dsLayout/getElements', {
        id: layout.id,
        sectionId: id,
        instanceId,
        prefixId,
        lang,
        view,
        parentElementId
      })

      if (elements.length) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]

          if (Object.prototype.hasOwnProperty.call(element, 'parentIndex')) {
            this.$method('dsElement/append', {
              parentId: elements[element.parentIndex].id,
              childId: element.id
            })
          } else {
            this.$method('dsElement/append', {
              parentId: parentElementId,
              childId: element.id
            })
          }
        }

        this.attachItem({}, { type: 'instance', id: instanceId })
      }
    },
    attachItem (context, { type, id }) {
      this.attached[type][id] = true
    },
    _detachItem (type, id) {
      if (this.attached[type][id]) {
        delete this.attached[type][id]
      }
    },
    _getLayoutId (id, instanceId, view = 'default') {
      const items = this.items[id] || []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (item.instanceId === instanceId) {
          return item.layout[view] || item.layout.default
        }
      }
    },
    update (context, { parentElementId, prevId, prevPrefixId, nextId, nextPrefixId }) {
      const content = this._getContent(nextPrefixId)
      const renderQueue = this._getRenderQueue(content)

      // update attached content
      for (let i = 0; i < renderQueue.content.length; i++) {
        const [sectionId, instanceId, contentIndex, contentId] = renderQueue.content[i]
        const prevContentId = this.getContentItem({}, { id: prevPrefixId, sectionId, instanceId, index: contentIndex })
        const contentType = this.$method('dsElement/getType', contentId)
        const layout = this._getLayoutId(sectionId, instanceId)
        const elements = this.$method('dsLayout/getElements', { id: layout.id, sectionId, instanceId })
        let elementId = ''

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]

          if (element.contentIndex === contentIndex) {
            elementId = instanceId + '$' + i
            break
          }
        }

        if (contentType[0] === 'section') {
          const prevWidgetId = this.$method('dsElement/getValue', prevContentId)

          // detach previous widget
          this.remove({}, { id: prevWidgetId, prefixId: prevPrefixId })

          const id = this.$method('dsElement/getValue', contentId)

          this.create({}, { id, parentElementId: elementId, prefixId: '' })
        } else {
          this.$method('dsElement/detachContent', { contentId: prevContentId, elementId })
          this.$method('dsElement/attachContent', { contentId, elementId })
        }

        this._detachItem('content', prevContentId)
      }
      const [prevItems, currentPrevId] = this._getItem(prevId, prevPrefixId)
      const [nextItems, currentNextId] = this._getItem(nextId, nextPrefixId)
      const renderLength = nextItems.length > prevItems.length ? nextItems.length : prevItems.length
      const layoutState = this.$method('dsLayout/getState')
      const attachInstance = []
      const detachInstance = []

      for (let i = 0; i < renderLength; i++) {
        const prevItem = prevItems[i]
        const nextItem = nextItems[i]

        if (nextItem) {
          if (prevItem) {
            // not same widget instance
            if (prevItem.instanceId !== nextItem.instanceId) {
              const prevLayoutId = prevItem.layout[layoutState] || prevItem.layout.default
              const nextLayoutId = nextItem.layout[layoutState] || nextItem.layout.default
              // update content if widgets share the same layout
              if (prevLayoutId === nextLayoutId) {
                const elements = this.$method('dsLayout/getElements', {
                  id: nextLayoutId,
                  sectionId: currentNextId,
                  instanceId: nextItem.instanceId,
                  prefix: nextPrefixId
                })
                // Update content
                for (let i = 0; i < elements.length; i++) {
                  const element = elements[i]

                  if (Object.prototype.hasOwnProperty.call(element, 'contentIndex')) {
                    const prevContentId = this.getContentItem({}, {
                      id: currentPrevId,
                      instanceId: prevItem.instanceId,
                      index: element.contentIndex
                    })
                    const nextContentId = this.getContentItem({}, {
                      id: currentNextId,
                      instanceId: nextItem.instanceId,
                      index: element.contentIndex
                    })
                    const nextType = this.$method('dsElement/getType', nextContentId)

                    if (nextType[0] === 'section') {
                      const prevId = this.$method('dsElement/getValue', prevContentId)
                      const nextId = this.$method('dsElement/getValue', nextContentId)

                      this.update({}, {
                        parentElementId: element.id,
                        prevId: prevId,
                        prevPrefixId,
                        nextId: nextId,
                        nextPrefixId
                      })
                    } else {
                      this.$method('dsElement/detachContent', { contentId: prevContentId, elementId: element.id })
                      this.$method('dsElement/attachContent', { contentId: nextContentId, elementId: element.id })
                    }
                  }
                }
              } else {
                // detach old element
                detachInstance.push({ currentPrevId, instanceId: prevItem.instanceId, prevLayoutId })
                // attach new element
                attachInstance.push({ currentNextId, instanceId: nextItem.instanceId, parentElementId, nextLayoutId })
              }
            }
          } else {
            const nextLayoutId = nextItem.layout[layoutState] || nextItem.layout.default
            // attach new element
            attachInstance.push({ currentNextId, instanceId: nextItem.instanceId, parentElementId, nextLayoutId })
          }
        } else {
          const prevLayoutId = prevItem.layout[layoutState] || prevItem.layout.default
          // No more new items, clear remaining previous items
          detachInstance.push({ currentPrevId, instanceId: prevItem.instanceId, prevLayoutId })
        }
      }

      // detach unused elements from the DOM
      if (detachInstance.length) {
        this._detachItem('widget', currentPrevId)

        for (let i = 0; i < detachInstance.length; i++) {
          const item = detachInstance[i]

          this._detachInstance(item.currentPrevId, item.instanceId, item.prevLayoutId)
        }
      }
      // attach used elements to the DOM
      if (attachInstance.length) {
        this.attachItem({}, { type: 'section', id: currentNextId })

        for (let i = 0; i < attachInstance.length; i++) {
          const item = attachInstance[i]

          this._createInstance(item.currentNextId, item.instanceId, item.parentElementId, item.nextLayoutId, nextPrefixId)
        }
      }
    },
    getContentItem (context, { id, instanceId, prefixId, index }) {
      const contentId = id + instanceId + '_' + this._getView(id)

      return this.content[prefixId] &&
        this.content[prefixId][contentId] &&
        this.content[prefixId][contentId][index]
    },
    _getContent (id) {
      return this.content[id]
    },
    _detachInstance (id, instanceId, layout, prefixId) {
      const elements = this.$method('dsLayout/getElements', {
        id: layout.id,
        sectionId: id,
        instanceId
      })

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        // detach content
        if (Object.prototype.hasOwnProperty.call(element, 'contentIndex')) {
          const contentId = this.getContentItem({}, { id: prefixId, widgetId: id, instanceId, index: element.contentIndex })
          const contentType = this.$method('dsElement/getType', contentId)
          // detach nested widgets
          if (contentType[0] === 'section') {
            const widgetId = this.$method('dsElement/getValue', { id: contentId })

            this.remove({}, { id: widgetId, prefixId })
          } else {
            this.$method('dsElement/detachContent', { contentId, elementId: element.id })
          }

          this._detachItem('content', contentId)
        }

        this.$method('dsElement/detachElement', element.id)
      }

      this._detachItem('instance', instanceId)
    },
    remove (context, { id, prefixId = '', layoutState = 'default' }) {
      const [items, currentId] = this._getItem(id, prefixId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const layoutId = item.layout[layoutState] || item.layout.default

        this._detachInstance(currentId, item.instanceId, layoutId, prefixId)
      }

      this._detachItem('widget', id)
    },
    setItems (context, items) {
      this.items = Object.assign(items, this.items)
    },
    setContent (context, { id, items }) {
      this.content[id] = { ...items, ...this.content[id] }
    },
    _getRenderQueue (items) {
      const render = {
        widget: {},
        instance: {},
        content: []
      }

      for (const widgetId in items) {
        if (Object.prototype.hasOwnProperty.bind(items, widgetId)) {
          if (!this.attached.widget[widgetId]) {
            render.widget[widgetId] = true
          } else {
            for (const instanceId in items[widgetId]) {
              if (Object.prototype.hasOwnProperty.bind(items[widgetId], instanceId)) {
                if (!this.attached.instance[instanceId]) {
                  render.instance[instanceId] = true
                } else {
                  for (let i = 0; i < items[widgetId][instanceId].length; i++) {
                    const contentId = items[widgetId][instanceId][i]

                    if (!this.attached.content[contentId]) {
                      render.content.push([widgetId, instanceId, i, contentId])
                    }
                  }
                }
              }
            }
          }
        }
      }

      return render
    },

    _getItem (id, prefix) {
      const prefixId = prefix + '$' + id

      if (this.items[prefixId]) {
        return [this.items[prefixId], prefixId, true]
      }

      return [this.items[id], id, false]
    }
  }
}

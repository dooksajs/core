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
    head: {},
    items: {},
    content: {},
    loaded: {},
    view: {},
    templates: {},
    layout: {},
    sectionParents: {},
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
    create ({ id, parentElementId, prefixId, lang }) {
      const [items, sectionId] = this._getItems(id, prefixId)
      let view = this._getSectionView(sectionId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        view = this._getInstanceView(view, item.layout)

        this._createInstance(sectionId, item.instanceId, item.groupId, item.layout, view, parentElementId, prefixId, lang)
      }

      this.attachItem({ type: 'section', id: sectionId })
    },
    insert ({ id, index, item }) {
      // check if section exists
      if (this.items[id]) {
        // create new id's
        item.groupId = this.$method('dsUtilities/generateId')
        item.instanceId = this.$method('dsUtilities/generateId')

        if (Number.isNaN(index)) {
          this.items[id].push(item)
        } else {
          this.items[id].splice(index, 0, item)
        }

        let view = this._getSectionView(id)

        view = this._getInstanceView(view, item.layout)

        const pageId = this.$method('dsRouter/getCurrentId')

        this._createInstance(id, item.instanceId, item.groupId, item.layout, view, 'appElement', pageId)
      }
    },
    setSectionParentId ({ childId, parentId }) {
      this.sectionParents[childId] = parentId
    },
    getSectionParentId (sectionId) {
      return this.sectionParents[sectionId]
    },
    _getSectionView (id) {
      return this.view[id] || 'default'
    },
    _getInstanceView (view, layout) {
      return layout[view] ? view : 'default'
    },
    setLayout (item) {
      this.layout = { ...this.layout, ...item }
    },
    getLayout (id) {
      return this.layout[id]
    },
    getHead (id) {
      return this.head[id]
    },
    set ({ pageId, payload }) {
      if (payload.items) {
        this.setItems(payload.items)
      }

      if (payload.content) {
        this.setContent({ id: pageId, items: payload.content })
      }

      if (payload.loaded) {
        this.loaded = { ...this.loaded, ...payload.loaded }
      }
      // the entry points for a page
      if (payload.head) {
        this.head = { ...this.head, ...payload.head }
      }

      if (payload.layout) {
        this.layout = { ...this.layout, ...payload.layout }
      }

      if (payload.templates) {
        this.templates = { ...this.templates, ...payload.templates }
      }
    },
    setLoaded ({ id, value }) {
      this.loaded[id] = value
    },
    _templateExists (sectionId, instanceId, layout, view) {
      let itemId = sectionId + instanceId + '_' + view
      // check if widget has layout and is loaded
      if (!this.loaded[itemId] && !layout[view]) {
        itemId = sectionId + instanceId + '_default'
        view = 'default'
      }

      // set if widget loaded
      // load widget template
      return !!this.loaded[itemId]
    },
    _loadTemplate (sectionId, instanceId, groupId, layout, prefixId, view, callback) {
      const content = this._getContent(prefixId)
      const defaultContent = content[sectionId + '_' + instanceId + '_default'] || []
      const modifiers = this.templates[layout[view].modifierId]

      this.$action('dsTemplate/create', {
        id: layout[view].templateId,
        sectionId,
        instanceId,
        groupId,
        defaultContent,
        modifiers,
        view,
        head: true
      }, {
        onSuccess: (result) => {
          callback(result[1])
        },
        onError: (e) => console.log(e)
      })
    },
    _createInstance (sectionId, instanceId, groupId, layout, view, parentElementId, prefixId, lang) {
      // check if instance is attached to DOM
      if (this._getAttachedItem('instance', instanceId)) {
        return
      }

      const templateExists = this._templateExists(sectionId, instanceId, layout, view)

      if (!templateExists) {
        this._loadTemplate(sectionId, instanceId, groupId, layout, prefixId, view, (id) => {
          this._renderLayout(id, sectionId, instanceId, prefixId, lang, view, parentElementId)
        })
      } else {
        this._renderLayout(layout[view].id, sectionId, instanceId, prefixId, lang, view, parentElementId)
      }
    },
    _renderLayout (id, sectionId, instanceId, prefixId, lang, view, parentElementId) {
      this.$method('dsLayout/render', {
        id,
        sectionId,
        instanceId,
        prefixId,
        lang,
        view,
        parentElementId
      })

      this.$method('dsWidget/attachItem', { type: 'instance', id: instanceId })
    },
    _getAttachedItem (type, id) {
      return this.attached[type][id]
    },
    attachItem ({ type, id }) {
      this.attached[type][id] = true
    },
    _detachItem (type, id) {
      if (this.attached[type][id]) {
        this.attached[type][id] = false
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
    update ({ parentElementId, prevId, prevPrefixId, nextId, nextPrefixId }) {
      const lang = this.$method('dsMetadata/getLang')
      const content = this._getContent(nextPrefixId)
      const renderQueue = this._getRenderQueue(content)
      // update attached content
      for (let i = 0; i < renderQueue.content.length; i++) {
        const [sectionId, instanceId, contentIndex, contentId] = renderQueue.content[i]
        const prevContentId = this.getContentItem({ sectionId: prevPrefixId, instanceId, parentElementId, index: contentIndex })
        const contentType = this.$method('dsElement/getType', contentId)
        const layout = this._getLayoutId(sectionId, instanceId)
        const elements = this.$method('dsLayout/getComponents', { id: layout.id, sectionId, instanceId })
        let elementId = ''

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]

          if (element.contentIndex === contentIndex) {
            // ISSUE: [DS-703] create a util function for elementId creation
            elementId = instanceId + '_' + i.toString().padStart(4, '0')
            break
          }
        }

        if (contentType[0] === 'section') {
          const sectionId = this.$method('dsElement/getValue', { id: prevContentId, lang })

          // detach previous widget
          this.remove({ sectionId, prefixId: prevPrefixId })

          const id = this.$method('dsElement/getValue', { id: contentId, lang })

          this.create({ id, parentElementId: elementId, prefixId: '', lang })
        } else {
          this.$method('dsElement/detachContent', { contentId: prevContentId, elementId })
          this.$method('dsElement/attachContent', { contentId, elementId })
        }

        this._detachItem('content', prevContentId)
      }

      const [prevItems, prevSectionId] = this._getItems(prevId, prevPrefixId)
      const [nextItems, nextSectionId] = this._getItems(nextId, nextPrefixId)
      const renderLength = nextItems.length > prevItems.length ? nextItems.length : prevItems.length
      const attachInstance = []
      const detachInstance = []

      for (let i = 0; i < renderLength; i++) {
        const prevItem = prevItems[i]
        const nextItem = nextItems[i]
        let prevView = this._getSectionView(prevSectionId)

        if (nextItem) {
          const nextView = this._getSectionView(nextSectionId)

          if (prevItem) {
            // not same widget instance
            // if (prevItem.instanceId !== nextItem.instanceId) {
            prevView = this._getInstanceView(prevView, prevItem.layout)
            const prevLayout = prevItem.layout[prevView]

            // const nextLayout = nextItem.layout[nextView] || nextItem.layout.default
            // update content if widgets share the same layout
            // if (prevLayout.id === nextLayout.id) {
            //   const elements = this.$method('dsLayout/getComponents', {
            //     id: nextLayout.id,
            //     sectionId: nextSectionId,
            //     instanceId: nextItem.instanceId,
            //     prefixId: nextPrefixId,
            //     view: nextView
            //   })

            //   // Update content
            //   for (let i = 0; i < elements.length; i++) {
            //     const element = elements[i]
            //     console.log(element)
            //     if (Object.prototype.hasOwnProperty.call(element, 'contentIndex')) {
            //       const prevContentId = this.getContentItem({
            //         id: prevSectionId,
            //         instanceId: prevItem.instanceId,
            //         prefixId: prevPrefixId,
            //         index: element.contentIndex
            //       })
            //       const nextContentId = this.getContentItem({
            //         id: nextSectionId,
            //         instanceId: nextItem.instanceId,
            //         prefixId: nextPrefixId,
            //         index: element.contentIndex
            //       })

            //       const nextType = this.$method('dsElement/getType', nextContentId)

            //       if (nextType === 'section') {
            //         const prevId = this.$method('dsElement/getValue', prevContentId)
            //         const nextId = this.$method('dsElement/getValue', nextContentId)

            //         this.update({
            //           parentElementId: element.id,
            //           prevId: prevId,
            //           prevPrefixId,
            //           nextId: nextId,
            //           nextPrefixId
            //         })
            //       } else {
            //         this.$method('dsElement/detachContent', { contentId: prevContentId, elementId: element.id })
            //         this.$method('dsElement/attachContent', { contentId: nextContentId, elementId: element.id })
            //       }
            //     }
            //   }
            // } else {
            // detach old element
            detachInstance.push({
              sectionId: prevSectionId,
              instanceId: prevItem.instanceId,
              layout: prevLayout,
              view: prevView
            })
            // attach new element
            attachInstance.push({
              instanceId: nextItem.instanceId,
              groupId: nextItem.groupId,
              parentElementId,
              layout: nextItem.layout,
              view: nextView
            })
            // }
            // }
          } else {
            // attach new element
            attachInstance.push({
              sectionId: nextSectionId,
              instanceId: nextItem.instanceId,
              parentElementId,
              layout: nextItem.layout,
              view: nextView
            })
          }
        } else {
          prevView = this._getInstanceView(prevView, prevItem.layout)
          const prevLayout = prevItem.layout[prevView]
          // No more new items, clear remaining previous items
          detachInstance.push({ sectionId: prevSectionId, instanceId: prevItem.instanceId, layout: prevLayout, view: prevView })
        }
      }
      // detach unused elements from the DOM
      if (detachInstance.length) {
        for (let i = 0; i < detachInstance.length; i++) {
          const item = detachInstance[i]

          this._detachInstance(item.sectionId, item.instanceId, item.layout.id, item.view, prevPrefixId)
        }

        this._detachItem('section', prevSectionId)
      }
      // attach used elements to the DOM
      if (attachInstance.length) {
        this.attachItem({ type: 'section', id: nextSectionId })

        for (let i = 0; i < attachInstance.length; i++) {
          const item = attachInstance[i]
          const view = item.layout[item.view] ? item.view : 'default'

          this._createInstance(nextSectionId, item.instanceId, item.groupId, item.layout, view, item.parentElementId, nextPrefixId, lang)
        }
      }
    },
    getContentItem ({ sectionId, instanceId, prefixId, parentElementId, index, view }) {
      if (!view) {
        view = this._getSectionView(sectionId)
      }

      const itemId = sectionId + instanceId + '_' + view

      if (this.content[prefixId] && this.content[prefixId][itemId]) {
        return this.content[prefixId][itemId][index]
      } else {
        const item = this.items[sectionId].find((item) => item.instanceId === instanceId)

        if (!item.layout[view]) {
          return this.getContentItem({ sectionId, instanceId, prefixId, parentElementId, index, view: 'default', head: false })
        }

        const templateExists = this._templateExists(sectionId, instanceId, item.layout, view)

        if (templateExists) {
          // check if template exists
          this._loadTemplate(sectionId, instanceId, item.groupId, item.layout, prefixId, view, () => {
            return this.getContentItem({ sectionId, instanceId, prefixId, parentElementId, index, head: false })
          })
        } else {
          return this.getContentItem({ sectionId, instanceId, prefixId, parentElementId, index, head: false })
        }
      }
    },
    _getContent (id) {
      return this.content[id]
    },
    _detachInstance (sectionId, instanceId, layoutId, view, prefixId) {
      const items = this.$method('dsLayout/getComponents', {
        instanceId,
        view
      })

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // detach content
        if (Object.prototype.hasOwnProperty.call(item, 'contentIndex')) {
          const contentId = this.getContentItem({ sectionId, instanceId, prefixId, index: item.contentIndex })
          const contentType = this.$method('dsElement/getType', contentId)

          // detach nested widgets
          if (contentType[0] === 'section') {
            const sectionId = this.$method('dsElement/getValue', { id: contentId })

            this.remove({ sectionId, prefixId })
          } else {
            this.$method('dsElement/detachContent', { contentId, elementId: item.elementId })
          }

          this._detachItem('content', contentId)
        }

        if (item.elementId) {
          this.$method('dsElement/detachElement', item.elementId)
        }
      }

      this._detachItem('instance', instanceId)
    },
    remove ({ sectionId, prefixId = '' }) {
      const [items, currentId] = this._getItems(sectionId, prefixId)
      let view = this._getSectionView(currentId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        let layout = item.layout[view]

        if (!item.layout[view]) {
          layout = item.layout.default
          view = 'default'
        }

        this._detachInstance(currentId, item.instanceId, layout.id, view, prefixId)
      }

      this._detachItem('section', sectionId)
    },
    setItems (items) {
      this.items = { ...this.items, ...items }
    },
    setContent ({ id, items }) {
      this.content[id] = { ...this.content[id], ...items }
    },
    _getRenderQueue (items) {
      const render = {
        section: {},
        instance: {},
        content: []
      }

      for (const itemId in items) {
        if (Object.prototype.hasOwnProperty.bind(items, itemId)) {
          const sectionId = itemId.slice(0, 23)

          if (!this.attached.section[sectionId]) {
            render.section[sectionId] = true
          } else {
            const instanceId = itemId.slice(23, 46)

            if (!this.attached.instance[instanceId]) {
              render.instance[instanceId] = true
            } else {
              for (let i = 0; i < items[itemId].length; i++) {
                const contentId = items[itemId][i]

                if (!this.attached.content[contentId]) {
                  render.content.push([sectionId, instanceId, i, contentId])
                }
              }
            }
          }
        }
      }

      return render
    },
    _getItemByInstanceId (id, prefixId, instanceId) {
      const [items, currentId] = this._getItems(id, prefixId)

      for (let i = 0; i < items.length; i++) {
        if (items[i].instanceId === instanceId) {
          return [items[i], currentId]
        }
      }
    },
    _getItems (id, prefixId) {
      const currentId = prefixId + '_' + id

      if (this.items[currentId]) {
        return [this.items[currentId], currentId, true]
      }

      return [this.items[id] || [], id, false]
    }
  }
}

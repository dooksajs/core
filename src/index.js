/**
 * @typedef {string} dsWidgetSectionId - Id for a collection of widgets
 */

/**
 * @typedef {string} dsWidgetInstanceId - Instance id for a widget
 */

/**
 * Dooksa widget plugin.
 * @namespace dsWidget
 */
export default {
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsView',
      version: 1
    },
    {
      name: 'dsContent',
      version: 1
    }
  ],
  data: {
    entry: {},
    content: {},
    loaded: {},
    view: {},
    templates: {},
    layout: {},
    sections: {},
    sectionParent: {},
    sectionView: {},
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
  /** @lends dsWidget */
  methods: {
    attach ({ type, id }) {
      this.attached[type][id] = true
    },
    /**
     * Create and attach widget
     * @param {Object} param
     * @param {dsWidgetSectionId} param.dsWidgetSectionId - Id for a widget
     * @param {dsViewId} param.dsViewId - Parent element the widget will append to
     * @param {string} param.prefixId - Namespace for section
     * @param {language} param.language
     */
    create ({ dsWidgetSectionId, dsViewId, prefixId, language }) {
      const [items, sectionId] = this._getSections(dsWidgetSectionId, prefixId)
      let view = this._getSectionView(sectionId)

      this.sectionView[dsWidgetSectionId] = dsViewId

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        view = this._getInstanceView(view, item.layout)

        this._createInstance(sectionId, item.instanceId, item.groupId, item.layout, view, dsViewId, prefixId, language)
      }

      this.attach({ type: 'section', id: sectionId })
    },
    /**
     * Get the dsContentId attached to a widget instance
     * @param {Object} param
     * @param {dsWidgetSectionId} param.dsWidgetSectionId - Id for a collection of widgets
     * @param {dsWidgetInstanceId} param.dsWidgetInstanceId - Instance id for a widget
     * @param {dsWidgetPrefixId} param.dsWidgetPrefixId - Namespace the of the widget instances
     * @returns {dsContentId}
     */
    getContentItem ({ dsWidgetSectionId, dsWidgetInstanceId, dsWidgetPrefixId, contentIndex, dsWidgetView }) {
      if (!dsWidgetView) {
        dsWidgetView = this._getSectionView(dsWidgetSectionId)
      }

      const itemId = dsWidgetSectionId + dsWidgetInstanceId + '_' + dsWidgetView

      if (this.content[dsWidgetPrefixId] && this.content[dsWidgetPrefixId][itemId]) {
        return this.content[dsWidgetPrefixId][itemId][contentIndex]
      } else {
        const item = this.sections[dsWidgetSectionId].find((item) => item.instanceId === dsWidgetInstanceId)

        if (!item.layout[dsWidgetView]) {
          return this.getContentItem({ dsWidgetSectionId, dsWidgetInstanceId, dsWidgetPrefixId, contentIndex, view: 'default', head: false })
        }

        const templateExists = this._templateExists(dsWidgetSectionId, dsWidgetInstanceId, item.layout, dsWidgetView)

        if (templateExists) {
          // check if template exists
          this._loadTemplate(dsWidgetSectionId, dsWidgetInstanceId, item.groupId, item.layout, dsWidgetPrefixId, dsWidgetView, () => {
            return this.getContentItem({ dsWidgetSectionId, dsWidgetInstanceId, dsWidgetPrefixId, contentIndex, head: false })
          })
        } else {
          return this.getContentItem({ dsWidgetSectionId, dsWidgetInstanceId, dsWidgetPrefixId, contentIndex, head: false })
        }
      }
    },
    /**
     * Get entry section
     * @param {dsPageId} id - page id
     * @returns {dsWidgetSectionId}
     */
    getEntry (id) {
      return this.entry[id]
    },
    /**
     * Get layout modifier
     * @param {dsLayoutId} id - layout id
     * @returns {}
     */
    getLayout (id) {
      return this.layout[id]
    },
    /**
     * Get parent section id
     * @param {dsWidgetSectionId} dsWidgetSectionId - widget section id
     * @returns {dsWidgetSectionId}
     */
    getSectionParentId (dsWidgetSectionId) {
      return this.sectionParent[dsWidgetSectionId]
    },
    /**
     * Insert widget within a section
     * @param {Object} param
     * @param {dsWidgetSectionId} param.dsWidgetSectionId - widget section id
     * @param {dsWIdgetItem} param.dsWidgetItem - widget item
     * @param {number} index - The position to insert within the section
     */
    insert ({ dsWidgetSectionId, dsWidgetItem, index }) {
      // check if section exists
      if (this.sections[dsWidgetSectionId]) {
        // create new id's
        dsWidgetItem.groupId = this.$method('dsUtilities/generateId')
        dsWidgetItem.instanceId = this.$method('dsUtilities/generateId')

        if (Number.isNaN(index)) {
          this.sections[dsWidgetSectionId].push(dsWidgetItem)
        } else {
          this.sections[dsWidgetSectionId].splice(index, 0, dsWidgetItem)
        }

        let view = this._getSectionView(dsWidgetSectionId)

        view = this._getInstanceView(view, dsWidgetItem.layout)

        const pageId = this.$method('dsRouter/getCurrentId')
        const dsViewId = this.sectionView[dsWidgetSectionId]

        this._createInstance(dsWidgetSectionId, dsWidgetItem.instanceId, dsWidgetItem.groupId, dsWidgetItem.layout, view, dsViewId, pageId)
      }
    },
    /**
     * Remove section
     * @param {Object} param
     * @param {dsWidgetSectionId} - Widget section id
     * @param {dsWidgetPrefixId} - Widget prefix
     */
    remove ({ dsWidgetSectionId, dsWidgetPrefixId = '' }) {
      const [items, currentId] = this._getSections(dsWidgetSectionId, dsWidgetPrefixId)
      let view = this._getSectionView(currentId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        let layout = item.layout[view]

        if (!item.layout[view]) {
          layout = item.layout.default
          view = 'default'
        }

        this._detachInstance(currentId, item.instanceId, layout.id, view, dsWidgetPrefixId)
      }

      this._detachItem('section', dsWidgetSectionId)
    },
    /**
     * Set widget data
     * @param {Object} param
     * @param {dsPageId} - page id
     * @param {Object} - payload
     */
    set ({ dsPageId, payload }) {
      if (payload.sections) {
        this.setSections(payload.sections)
      }

      if (payload.content) {
        this.setContent({ dsPageId, items: payload.content })
      }

      if (payload.loaded) {
        this.loaded = { ...this.loaded, ...payload.loaded }
      }
      // the entry points for a page
      if (payload.entry) {
        this.entry = { ...this.entry, ...payload.entry }
      }

      if (payload.layout) {
        this.layout = { ...this.layout, ...payload.layout }
      }

      if (payload.templates) {
        this.templates = { ...this.templates, ...payload.templates }
      }
    },
    setContent ({ dsPageId, items }) {
      this.content[dsPageId] = { ...this.content[dsPageId], ...items }
    },
    setSections (sections) {
      this.sections = { ...this.sections, ...sections }
    },
    setLayout (item) {
      this.layout = { ...this.layout, ...item }
    },
    setLoaded ({ id, value }) {
      this.loaded[id] = value
    },
    setSectionParentId ({ dsWidgetSectionId, dsWidgetSectionParentId }) {
      this.sectionParent[dsWidgetSectionId] = dsWidgetSectionParentId
    },
    update ({ dsWidgetSectionId, dsWidgetPrefixId, dsWidgetNextSectionId, dsWidgetNextPrefixId, dsViewId }) {
      const lang = this.$method('dsMetadata/getLang')

      if (!dsViewId) {
        dsViewId = this.sectionView[dsWidgetSectionId] || this.$method('dsView/getRootViewId')
      }

      const [prevItems, prevSectionId] = this._getSections(dsWidgetSectionId, dsWidgetPrefixId)
      const [nextItems, nextSectionId] = this._getSections(dsWidgetNextSectionId, dsWidgetNextPrefixId)
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
            //         const prevId = this.$method('dsElement/getDataValue', prevContentId)
            //         const nextId = this.$method('dsElement/getDataValue', nextContentId)

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
              dsViewId,
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
              dsViewId,
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

          this._detachInstance(item.sectionId, item.instanceId, item.layout.id, item.view, dsWidgetPrefixId)
        }

        this._detachItem('section', prevSectionId)
      }
      // attach used elements to the DOM
      if (attachInstance.length) {
        this.attach({ type: 'section', id: nextSectionId })

        for (let i = 0; i < attachInstance.length; i++) {
          const item = attachInstance[i]
          const view = item.layout[item.view] ? item.view : 'default'

          this._createInstance(nextSectionId, item.instanceId, item.groupId, item.layout, view, item.dsViewId, dsWidgetNextPrefixId, lang)
        }
      }
    },
    _createInstance (sectionId, instanceId, groupId, layout, view, parentElementId, prefixId, lang) {
      // check if instance is attached to DOM
      if (this._getAttached('instance', instanceId)) {
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
    /**
     * Remove widget instance and its content and view dependencies
     * @param {dsWidgetSectionId} dsWidgetSectionId -
     * @param {dsWidgetInstanceId} dsWidgetInstanceId -
     * @param {dsLayoutId} dsLayoutId -
     * @param {dsWidgetView} dsWidgetView -
     * @param {dsWidgetPrefixId} dsWidgetPrefixId -
     */
    _detachInstance (dsWidgetSectionId, dsWidgetInstanceId, dsLayoutId, dsWidgetView, dsWidgetPrefixId) {
      const items = this.$method('dsLayout/getComponents', {
        dsWidgetInstanceId,
        dsWidgetView
      })

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // detach content
        if (Object.prototype.hasOwnProperty.call(item, 'contentIndex')) {
          const dsContentId = this.getContentItem({ dsWidgetSectionId, dsWidgetInstanceId, dsWidgetPrefixId, contentIndex: item.contentIndex })
          const dsContentType = this.$method('dsContent/getType', dsContentId)

          // detach nested widgets
          if (dsContentType[0] === 'section') {
            const dsWidgetSectionId = this.$method('dsContent/getValue', { dsContentId })

            this.remove({ dsWidgetSectionId, dsWidgetPrefixId })
          }

          this._detachItem('content', dsContentId)
        }

        if (item.dsViewId) {
          this.$method('dsView/remove', item.dsViewId)
        }
      }

      this._detachItem('instance', dsWidgetInstanceId)
    },
    _getAttached (type, id) {
      return this.attached[type][id]
    },
    _detachItem (type, id) {
      if (this.attached[type][id]) {
        this.attached[type][id] = false
      }
    },
    _getLayoutId (id, instanceId, view = 'default') {
      const sections = this.sections[id] || []

      for (let i = 0; i < sections.length; i++) {
        const widget = sections[i]

        if (widget.instanceId === instanceId) {
          return widget.layout[view] || widget.layout.default
        }
      }
    },
    _getContent (id) {
      return this.content[id]
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
      const [items, currentId] = this._getSections(id, prefixId)

      for (let i = 0; i < items.length; i++) {
        if (items[i].instanceId === instanceId) {
          return [items[i], currentId]
        }
      }
    },
    _getSections (id, prefixId) {
      const currentId = prefixId + '_' + id

      if (this.sections[currentId]) {
        return [this.sections[currentId], currentId, true]
      }

      return [this.sections[id] || [], id, false]
    },
    _getSectionView (id) {
      return this.view[id] || 'default'
    },
    _getInstanceView (view, layout) {
      return layout[view] ? view : 'default'
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
    _renderLayout (dsLayoutId, dsWidgetSectionId, dsWidgetInstanceId, dsWidgetPrefixId, lang, view, dsViewId) {
      this.$method('dsLayout/render', {
        dsLayoutId,
        dsWidgetSectionId,
        dsWidgetInstanceId,
        dsWidgetPrefixId,
        lang,
        view,
        dsViewId
      })

      this.attach({ type: 'instance', id: dsWidgetInstanceId })
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
    }
  }
}

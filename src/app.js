/**
 * Ds App plugin.
 * @module plugin
 */

export default {
  name: 'dsApp',
  version: 1,
  dependencies: [
    {
      name: 'dsRouter',
      version: 1
    },
    {
      name: 'dsElement',
      version: 1
    },
    {
      name: 'dsParameters',
      version: 1
    },
    {
      name: 'dsAction',
      version: 1
    },
    {
      name: 'dsWidget',
      version: 1
    }
  ],
  data: {
    assetsURL: '',
    appElementId: '',
    pages: {},
    pageTypes: {},
    template: {}
  },
  setup ({ appCache = {}, assetsURL }) {
    this.assetsURL = assetsURL
    this.set({}, appCache)
    // get current page id
    const pageId = this.$method('dsRouter/getCurrentId')
    // render init page
    this._render(pageId)
  },
  methods: {
    fetch (context, id) {
      return new Promise(resolve => {
        this.$resource.script({
          id: 'ds-app-cache__' + id,
          src: this.assetsURL + '/app_cache/' + window.location.hostname + '/' + id + '.js',
          globalVars: ['dsAppCache'],
          onSuccess: ({ dsAppCache }) => resolve(dsAppCache),
          onError: () => resolve()
        })
      })
    },
    update (context, { prevId, nextId }) {
      const prevPage = this.pages[prevId]
      const prevPageType = this.pageTypes[prevPage.pageTypeId]
      const prevTemplate = this.templates[prevPageType.templateId]
      // next page
      const nextPage = this.pages[nextId]
      const nextPageType = this.pageTypes[nextPage.pageTypeId]
      const nextTemplate = this.templates[nextPageType.templateId]

      this.$method('dsElement/detachContent', { contentId: prevPageType.templateId, elementId: 'appElement' })
      this.$method('dsElement/attachContent', { contentId: nextPageType.templateId, elementId: 'appElement' })

      const nextLength = nextTemplate.widgets.length
      const prevLength = prevTemplate.widgets.length
      const renderLength = nextLength > prevLength ? nextLength : prevLength

      for (let i = 0; i < renderLength; i++) {
        const nextWidgetId = nextTemplate.widgets[i]
        const prevWidgetId = prevTemplate.widgets[i]

        if (nextWidgetId) {
          this.$method('dsWidget/update', {
            parentElementId: 'appElement',
            prevId,
            prevInstanceId: prevWidgetId,
            nextId,
            nextInstanceId: nextWidgetId
          })
        } else if (prevWidgetId) {
          this.$method('dsWidget/remove', {
            id: prevId,
            instanceId: prevWidgetId
          })
        }
      }
    },
    set (context, item) {
      // Set actions
      if (item.actions) {
        this.$method('dsAction/set', item.actions.items)
        this.$method('dsAction/setConditions', item.actions.conditions)
      }
      // Set params
      if (item.parameters) {
        this.$method('dsParameters/set', item.parameters.items)
        this.$method('dsParameters/setUsedBy', item.parameters.usedBy)
      }
      // Set element content
      if (item.elements) {
        if (item.elements.values) {
          this.$method('dsElement/setValues', item.elements.values)
        }

        if (item.elements.attributes) {
          this.$method('dsElement/setAttributes', item.elements.attributes)
        }
      }
      // Set widgets
      if (item.widgets) {
        this.$method('dsWidget/setComponentData', item.widgets.componentData)
        this.$method('dsWidget/setLayoutStart', item.widgets.layoutStart)
        this.$method('dsWidget/setLayout', item.widgets.layout)
        this.$method('dsWidget/setDefaultItems', item.widgets.defaultItems)
        this.$method('dsWidget/setItems', item.widgets.items)
      }
      // set routes
      this.$method('dsRouter/set', item.routes)
      // Set page
      this._setPage(item.pages)
      this._setPageType(item.pageTypes)
      this._setTemplate(item.templates)
    },
    _render (pageId) {
      const page = this.pages[pageId]
      // todo: build metadata
      const pageType = this.pageTypes[page.pageTypeId]
      const template = this.templates[pageType.templateId]
      // add attributes to appElement
      this.$method('dsElement/attachContent', { contentId: pageType.templateId, elementId: 'appElement' })

      for (let i = 0; i < template.widgets.length; i++) {
        const instanceId = template.widgets[i]

        this.$method('dsWidget/create', { parentElementId: 'appElement', id: pageId, instanceId: instanceId })
      }
    },
    _setPage (item) {
      this.pages = Object.assign(item, this.pages)
    },
    _setPageType (item) {
      this.pageTypes = Object.assign(item, this.pageTypes)
    },
    _setTemplate (item) {
      this.templates = Object.assign(item, this.templates)
    }
  }
}

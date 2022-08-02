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
      name: 'dsComponent',
      version: 1
    },
    {
      name: 'dsLayout',
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

    if (appCache.app) {
      this.$method('dsMetadata/setTheme', appCache.app.theme)
      this.$method('dsMetadata/setAppId', appCache.app.id)
    }

    this.set({}, appCache)
    // get current page id
    const pageId = this.$method('dsRouter/getCurrentId')
    // check for redirects
    if (!pageId) {
      return this.$method('dsRouter/navigate', appCache.routes.currentPath)
    }
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
      const prevTemplateId = prevPage.templateId || prevPageType.templateId
      const prevTemplate = this.templates[prevTemplateId]
      // next page
      const nextPage = this.pages[nextId]
      const nextPageType = this.pageTypes[nextPage.pageTypeId]
      const nextTemplateId = nextPage.templateId || nextPageType.templateId
      const nextTemplate = this.templates[nextTemplateId]
      // ISSUE: What is this for?
      // this.$method('dsElement/detachContent', { contentId: prevTemplateId, elementId: 'appElement' })
      // this.$method('dsElement/attachContent', { contentId: nextTemplateId, elementId: 'appElement' })

      const nextLength = nextTemplate.widgets.length
      const prevLength = prevTemplate.widgets.length
      const renderLength = nextLength > prevLength ? nextLength : prevLength

      for (let i = 0; i < renderLength; i++) {
        const nextSectionId = nextTemplate.widgets[i]
        const prevSectionId = prevTemplate.widgets[i]

        if (nextSectionId) {
          this.$method('dsWidget/update', {
            parentElementId: 'appElement',
            prevPrefixId: prevId,
            prevId: prevSectionId,
            nextPrefixId: nextId,
            nextId: nextSectionId
          })
        } else if (prevSectionId) {
          this.$method('dsWidget/remove', {
            sectionId: prevSectionId,
            prefixId: prevId
          })
        }
      }
    },
    set (context, item) {
      // set routes
      this.$method('dsRouter/set', { id: item.id, item: item.routes })
      // set actions
      if (item.actions) {
        this.$method('dsAction/set', item.actions.items)
        this.$method('dsAction/setConditions', item.actions.conditions)
      }
      // set params
      if (item.parameters) {
        this.$method('dsParameters/set', item.parameters.items)
        this.$method('dsParameters/setUsedBy', item.parameters.usedBy)
      }

      if (item.components) {
        this.$method('dsComponent/set', item.components)
      }

      if (item.layouts) {
        if (item.layouts.items) {
          this.$method('dsLayout/setItems', item.layouts.items)
        }

        if (item.layouts.head) {
          this.$method('dsLayout/setHead', item.layouts.head)
        }

        if (item.layouts.modifiers) {
          this.$method('dsLayout/setModifiers', item.layouts.modifiers)
        }
      }
      // set element content
      if (item.elements) {
        if (item.elements.value) {
          this.$method('dsElement/setValues', item.elements.value)
        }

        if (item.elements.attributes) {
          this.$method('dsElement/setAttributes', item.elements.attributes)
        }

        if (item.elements.type) {
          this.$method('dsElement/setTypes', item.elements.type)
        }
      }
      // set widgets
      if (item.widgets) {
        this.$method('dsWidget/set', { pageId: item.id, payload: item.widgets })
      }
      // set page
      this._setPage(item.id, item.metadata)
      this._setPageType(item.pageType.id, item.pageType)
      this._setTemplate(item.templates)
    },
    _render (pageId) {
      const page = this.pages[pageId]
      // todo: build metadata
      const pageType = this.pageTypes[page.pageTypeId]
      const template = this.templates[page.templateId || pageType.templateId]
      // add attributes to appElement
      // this.$method('dsElement/attachContent', { contentId: pageType.templateId, elementId: 'appElement' })

      for (let i = 0; i < template.widgets.length; i++) {
        const sectionId = template.widgets[i]

        this.$method('dsWidget/create', { parentElementId: 'appElement', prefixId: pageId, id: sectionId, lang: this.lang })
      }
    },
    _setPage (id, item) {
      this.pages[id] = item
    },
    _setPageType (id, item) {
      this.pageTypes[id] = item
    },
    _setTemplate (item) {
      this.templates = { ...this.templates, ...item }
    }
  }
}

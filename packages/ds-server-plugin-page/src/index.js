import dsPage from '@dooksa/ds-plugin-page'

function ValidateItem () {
  this.isValid = true
  this.data = []
}

ValidateItem.prototype.setError = function (message) {
  this.isValid = false
  this.error = message
}

ValidateItem.prototype.id = (string) => {
  const id = string.split('_')

  return {
    default: '_' + id[1] + '_',
    prefix: id[0],
    suffix: id[2]
  }
}

/**
 * DsPage plugin.
 * @namespace dssPage
 */
export default {
  name: 'dssPage',
  version: 1,
  dependencies: [
    {
      name: 'dssDatabase'
    },
    {
      name: 'dssUser'
    },
    {
      name: 'dssWidget'
    }
  ],
  data: {
    ...dsPage.data,
    cache: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'page',
      fields: [
        {
          name: 'id',
          type: 'string',
          options: {
            primaryKey: true,
            defaultValue: () => this.$method('dsData/generateId')
          }
        },
        {
          name: 'path',
          type: 'string',
          options: {
            unique: true,
            allowNull: false
          }
        },
        {
          name: 'language',
          type: 'string',
          options: {
            allowNull: false
          }
        }
      ]
    })

    // section associations
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'page',
      target: 'section',
      options: {
        through: 'pageSections'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'section',
      target: 'page',
      options: {
        through: 'pageSections'
      }
    })

    // user associations
    this.$method('dssDatabase/association', {
      type: 'belongsTo',
      source: 'page',
      target: 'user',
      options: {
        foreignKey: {
          allowNull: false
        }
      }
    })
    this.$method('dssDatabase/association', {
      type: 'hasMany',
      source: 'user',
      target: 'page'
    })

    // route: create post
    this.$method('dssWebServer/route', {
      path: '/page',
      method: 'post',
      handler: this._create.bind(this)
    })

    // route: get page by id
    this.$method('dssWebServer/route', {
      path: '/page/:pageId',
      method: 'get',
      handler: this._getOneById.bind(this)
    })
  },
  /** @lends dssPage */
  methods: {
    async _create (request, response) {
      try {
        const user = await this.$method('dssUser/auth', request)
        const data = request.body
        const content = this._processContent(data.content)

        if (!content.isValid) {
          return response.code(400).send(new Error(content.error))
        }

        const component = this._processComponent(data.components)

        if (!component.isValid) {
          return response.code(400).send(new Error(component.error))
        }

        const layout = this._processLayout(data.layouts)

        if (!layout.isValid) {
          return response.code(400).send(new Error(layout.error))
        }

        const section = this._processSection(data.sections)

        if (!section.isValid) {
          return response.code(400).send(new Error(section.error))
        }

        const widget = this._processWidget(data.widgets, {
          userId: user.id
        })

        if (!widget.isValid) {
          return response.code(400).send(new Error(widget.error))
        }

        const action = this._processAction(data.actions, {
          userId: user.id
        })

        if (!action.isValid) {
          return response.code(400).send(new Error(action.error))
        }

        data.userId = user.id

        this.$setDataValue('dssPage/cache', {
          source: data,
          options: {
            id: data.id
          }
        })

        const Page = this.$getDataValue('dssDatabase/models', { id: 'page' }).item
        const page = await Page.findByPk(data.id)

        if (!page) {
          await Page.create({
            id: data.id,
            path: data.path,
            language: data.language,
            userId: user.id
          })
        } else if (
          page.path !== data.path ||
          page.language !== data.language ||
          page.userId !== user.id
        ) {
          page.page = data.path
          page.language = data.language
          page.userId = user.id

          await page.save()
        }

        const Content = this.$getDataValue('dssDatabase/models', { id: 'content' }).item
        const Widget = this.$getDataValue('dssDatabase/models', { id: 'widget' }).item
        const Layout = this.$getDataValue('dssDatabase/models', { id: 'layout' }).item
        const Component = this.$getDataValue('dssDatabase/models', { id: 'component' }).item
        const Section = this.$getDataValue('dssDatabase/models', { id: 'section' }).item

        const widgets = await Widget.bulkCreate(widget.data, {
          updateOnDuplicate: ['groupId']
        })

        const sections = await Section.bulkCreate(section.data, {
          updateOnDuplicate: ['groupId', 'mode', 'data']
        })

        const layouts = await Layout.bulkCreate(layout.data, {
          updateOnDuplicate: ['data']
        })

        await Content.bulkCreate(content.data, {
          updateOnDuplicate: ['groupId', 'language', 'type', 'data']
        })

        await Component.bulkCreate(component.data, {
          updateOnDuplicate: ['data']
        })

        // add widgetContent, widgetLayout association
        for (let i = 0; i < widgets.length; i++) {
          const widget = widgets[i]
          const content = data.widgets.content[widget.id]

          if (content.length) {
            const contentIds = []

            for (let i = 0; i < content.length; i++) {
              const contentId = content[i] + data.language

              if (!contentId.includes(contentId)) {
                contentIds.push(contentId)
              }
            }

            await widget.addContents(contentIds)
          }

          await widget.addLayouts(data.widgets.layouts[widget.id])
        }

        for (let i = 0; i < sections.length; i++) {
          const section = sections[i]
          const widgetIds = []
          const widgets = data.sections.items[section.id]

          for (let i = 0; i < widgets.length; i++) {
            const widgetId = widgets[i]

            // ISSUE: will need to manage page prefix and widget suffix
            if (!widgetIds.includes(widgetId)) {
              widgetIds.push(widgetId)
            }
          }

          section.addWidgets(widgetIds)
        }

        // add layoutComponent association
        for (let i = 0; i < layouts.length; i++) {
          const layout = layouts[i]
          const layoutItems = data.layouts.items[layout.id]
          const components = []

          for (let i = 0; i < layoutItems.length; i++) {
            const item = layoutItems[i]

            if (item.componentId && !components.includes(item.componentId)) {
              components.push(item.componentId)
            }
          }

          await layout.addComponents(components)
        }
      } catch (error) {
        if (error.message === 'Unauthorized') {
          response.code(401).send(error)
        }

        response.code(500).send(error)
      }
    },
    _getOneById (request, response) {
      const result = this.$getDataValue('dssPage/cache', { id: request.params.pageId })

      // if (!result.isEmpty) {
      //   return response.send(result.item)
      // }

      const Page = this.$getDataValue('dssDatabase/models', { id: 'page' }).item

      // Need to get all related data
      Page.findByPk(request.params.pageId)
        .then((page) => {
          if (!page) {
            response.code(404).send(new Error('Page not found'))
          }

          this.$setDataValue('dssPage/cacheItems', {
            source: result.dataValues,
            options: {
              id: result.id
            }
          })

          response.send(page)
        })
    },
    _processAction (data, include) {
      const result = new ValidateItem()
      const actionItems = data.items

      result.cached = false

      for (const id in data.sequence) {
        if (Object.hasOwn(data.sequence, id)) {

        }
      }
      for (const id in actionItems) {
        if (Object.hasOwnProperty.call(actionItems, id)) {
          const source = actionItems[id]
          let setData = this.$setDataValue('dssAction/items', {
            source,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const contentType = data.type[id]
          setData = this.$setDataValue('dssContent/type', {
            source: contentType,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const idSplit = result.id(id)

          result.data.push({
            id,
            groupId: idSplit.default,
            language: idSplit.suffix,
            data: {
              items: content,
              type: contentType
            },
            type: contentType.name
          })
        }
      }

      return result
    },
    _processContent (data) {
      const result = new ValidateItem()
      const contentItems = data.items

      for (const id in contentItems) {
        if (Object.hasOwnProperty.call(contentItems, id)) {
          const content = contentItems[id]
          let setData = this.$setDataValue('dssContent/items', {
            source: content,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const contentType = data.type[id]
          setData = this.$setDataValue('dssContent/type', {
            source: contentType,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const idSplit = result.id(id)

          result.data.push({
            id,
            groupId: idSplit.default,
            language: idSplit.suffix,
            data: {
              items: content,
              type: contentType
            },
            type: contentType.name
          })
        }
      }

      return result
    },
    _processComponent (data) {
      const result = new ValidateItem()

      for (const id in data.items) {
        if (Object.hasOwnProperty.call(data.items, id)) {
          const component = data.items[id]
          const setData = this.$setDataValue('dssComponent/items', {
            source: component,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          result.data.push({
            id,
            data: component
          })
        }
      }

      return result
    },
    _processLayout (data) {
      const result = new ValidateItem()

      for (const id in data.items) {
        if (Object.hasOwnProperty.call(data.items, id)) {
          const layout = data.items[id]
          const setData = this.$setDataValue('dssLayout/items', {
            source: layout,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          result.data.push({
            id,
            data: layout
          })
        }
      }

      return result
    },
    _processSection (data) {
      const result = new ValidateItem()

      for (const id in data.items) {
        if (Object.hasOwnProperty.call(data.items, id)) {
          const section = data.items[id]
          let setData = this.$setDataValue('dssSection/items', {
            source: section,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const idSplit = result.id(id)
          const mode = data.mode[idSplit.default]
          setData = this.$setDataValue('dssSection/mode', {
            source: mode,
            options: { id: idSplit.default }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          result.data.push({
            id,
            mode,
            groupId: idSplit.default,
            data: section
          })
        }
      }

      return result
    },
    _processWidget (data, include) {
      const result = new ValidateItem()

      for (const id in data.items) {
        if (Object.hasOwnProperty.call(data.items, id)) {
          const item = data.items[id]
          let setData = this.$setDataValue('dssWidget/items', {
            source: item,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const mode = data.mode[id]
          setData = this.$setDataValue('dssWidget/mode', {
            source: mode,
            options: { id }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const affixId = id + mode
          const content = data.content[affixId]
          const suffixId = mode

          setData = this.$setDataValue('dssWidget/content', {
            source: content,
            options: { id, suffixId }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const events = data.events[affixId]

          if (events) {
            setData = this.$setDataValue('dssWidget/events', {
              source: events,
              options: { id, suffixId }
            })

            if (!setData.isValid) {
              result.setError(setData.error.details)

              return result
            }
          }

          const layoutId = data.layouts[affixId]
          setData = this.$setDataValue('dssWidget/layouts', {
            source: layoutId,
            options: { id, suffixId }
          })

          if (!setData.isValid) {
            result.setError(setData.error.details)

            return result
          }

          const section = data.sections[affixId]

          if (section) {
            setData = this.$setDataValue('dssWidget/sections', {
              source: section,
              options: { id, suffixId }
            })

            if (!setData.isValid) {
              result.setError(setData.error.details)

              return result
            }
          }

          result.data.push({
            id: affixId,
            defaultId: id,
            groupId: item,
            mode,
            userId: include.userId
          })
        }
      }

      return result
    },
    _validate (data, name) {
      const result = {
        isValid: true,
        data: []
      }

      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const collection = data[key]

          for (const id in collection) {
            if (Object.hasOwnProperty.call(collection, id)) {
              const source = collection[id]

              const setData = this.$setDataValue(name + '/' + key, {
                source,
                options: { id }
              })

              if (!setData.isValid) {
                result.isValid = false
                result.error = 'Schema validation failed: ' + name + '/' + key + '/' + id

                return result
              }

              result.data.push({
                id,
                data: source
              })
            }
          }
        }
      }

      return result
    }
  }
}
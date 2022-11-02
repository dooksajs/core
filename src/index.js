/**
 * Ds Plugin.
 * @module plugin
 */
export default {
  name: 'dsTemplate',
  version: 1,
  dependencies: [
    {
      name: 'dsUtilities',
      version: 1
    }
  ],
  data: {
    entry: {},
    items: {},
    components: {},
    modifiers: {}
  },
  methods: {
    create (context, {
      id,
      entry,
      sectionId = this.$method('dsUtilities/generateId'),
      instanceId,
      groupId = this.$method('dsUtilities/generateId'),
      defaultContent,
      modifiers = {},
      view = 'default',
      head = false
    }) {
      // get template
      let item = this.items[entry] || this.items[this.entry[id]]

      if (!item) {
        return new Promise(resolve => {
          this._fetch(id)
            .then(() => {
              entry = this.entry[id]
              item = this.items[entry]

              const result = this._constructor(id, entry, item, sectionId, instanceId, groupId, defaultContent, modifiers, view, head)

              resolve(result)
            })
        })
      }

      return this._constructor(id, entry, item, sectionId, instanceId, groupId, defaultContent, modifiers, view, head)
    },
        widgets: {
          items: {},
          content: {},
          layout: {}
        },
        elements: {
          value: {},
          type: {}
        }
      }

      if (head) {
        const layoutId = template.items[0]
        const layout = {}
        const itemId = sectionId + instanceId + '_' + view
        const [content, elements] = this._createElements(template.elements[0], view, groupId, defaultContent, modifiers)
        const modifierId = id + layoutId

        if (modifiers[modifierId]) {
          item.widgets.layout[itemId] = modifiers[modifierId]
        }

        item.widgets.content[itemId] = content
        item.elements = elements
        layout[view] = { id: layoutId }

        this.$method('dsWidget/setLoaded', { id: itemId, value: true })
      } else {
        for (let i = 0; i < template.items.length; i++) {
          const layoutId = template.items[i]
          const layout = {}
          const instanceId = this.$method('dsUtilities/generateId')
          const itemId = sectionId + instanceId + '_default'
          const [content, elements] = this._createElements(template.elements[i], view, groupId, defaultContent, modifiers)
          const modifierId = id + layoutId

          if (modifiers[modifierId]) {
            item.widgets.layout[sectionId + instanceId + '_default'] = modifiers[modifierId]
          }

          item.widgets.content[itemId] = content
          item.elements.value = { ...item.elements.value, ...elements.value }
          item.elements.type = { ...item.elements.type, ...elements.type }

          layout.default = { id: layoutId }

          if (!item.widgets.items[sectionId]) {
            item.widgets.items[sectionId] = [{ groupId, instanceId, layout }]
          } else {
            item.widgets.items[sectionId].push({ groupId, instanceId, layout })
          }

          this.$method('dsWidget/setLoaded', { id: itemId, value: true })
        }
      }

      // Set element content
      if (item.elements) {
        if (item.elements.value) {
          this.$method('dsElement/setValues', item.elements.value)
        }

        if (item.elements.type) {
          this.$method('dsElement/setTypes', item.elements.type)
        }
      }
      // Set widgets
      if (item.widgets) {
        if (item.widgets.items) {
          this.$method('dsWidget/setItems', item.widgets.items)
        }

        if (item.widgets.layout) {
          this.$method('dsWidget/setLayout', item.widgets.layout)
        }

        if (item.widgets.content) {
          const id = this.$method('dsRouter/getCurrentId')

          this.$method('dsWidget/setContent', { id, items: item.widgets.content })
        }
      }

      return [sectionId, item]
    },
    set (context, item) {
      this.widgets = { ...this.widgets, ...item }
    },
    _createElements (items, view, groupId, defaultContent = [], modifiers) {
      const elements = {
        value: {},
        type: {}
      }
      const content = []
      const values = items.value
      const types = items.type

      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        const [type, permanent] = types[i]
        let id = this.$method('dsUtilities/generateId')
        let exists = false

        if (defaultContent.length && permanent) {
          for (let i = 0; i < defaultContent.length; i++) {
            const contentId = defaultContent[i]
            const contentType = this.$method('dsElement/getType', contentId)

            if (type === contentType[0]) {
              id = contentId
              defaultContent.splice(i, 1)
              exists = true
              break
            }
          }
        }

        content.push(id)

        if (!exists) {
          elements.type[id] = [type, permanent]

          if (type === 'section') {
            const elementValue = {}

            for (let i = 0; i < value.length; i++) {
              const [lang, templateId] = value[i]
              const [sectionId] = this.create({}, { id: templateId, defaultContent, groupId, view, modifiers, lang })

              elementValue[lang] = sectionId
            }

            elements.value[id] = elementValue
          } else {
            elements.value[id] = value
          }
        }
      }

      return [content, elements, defaultContent]
    _fetch (id) {
      return new Promise((resolve, reject) => {
        this.$action('dsDatabase/getOne', { collection: 'widgetTemplates', id },
          {
            onSuccess: (record) => {
              this.set({}, { id: record.id, item: record })
              resolve(record)
            },
            onError: (error) => {
              console.error(error)
              reject(error)
            }
          }
        )
      })
    },
    }
  }
}

/**
 * @namespace dsTemplate
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
  /** @lends dsTemplate */
  methods: {
    create ({
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
    _constructor (id, entry, item, sectionId, instanceId, groupId, defaultContent, modifiers, view, head) {
      let layoutEntry = ''
      const result = {
        layoutEntry: '',
        widgets: {
          items: {},
          content: {},
          layout: {}
        },
        content: {
          value: {},
          type: {}
        }
      }
      if (head) {
        const layoutId = item.layouts[0]
        const layout = {}
        const itemId = sectionId + instanceId + '_' + view
        const i = 0

        if (item.content[i]) {
          const [contentRefs, content] = this._createContent(item.content[i], view, groupId, defaultContent, modifiers)
          const modifierId = entry + layoutId

          if (modifiers[modifierId]) {
            result.widgets.layout = { [itemId]: modifiers[modifierId] }
          }

          result.widgets.content[itemId] = contentRefs
          result.content = content
        }

        // add events
        if (item.events[i]) {
          const events = item.events[i]

          result.events = result.events || {}

          for (const key in events) {
            if (Object.hasOwnProperty.call(events, key)) {
              const event = events[key]
              const eventId = instanceId + '_' + key.padStart(4, '0')

              for (const key in event) {
                if (Object.hasOwnProperty.call(event, key)) {
                  const actions = event[key]

                  result.events[eventId + '_' + key] = actions
                }
              }
            }
          }
        }

        layoutEntry = layoutId
        layout[view] = { id: layoutId }

        this.$method('dsWidget/setLoaded', { id: itemId, value: true })
      } else {
        for (let i = 0; i < item.layouts.length; i++) {
          const layoutId = item.layouts[i]
          const layout = {}
          const instanceId = this.$method('dsUtilities/generateId')
          const itemId = sectionId + instanceId + '_default'

          // create content
          if (item.content && item.content[i]) {
            const [contentRefs, content] = this._createContent(item.content[i], view, groupId, defaultContent, modifiers)

            const modifierId = entry + layoutId

            if (modifiers[modifierId]) {
              if (!result.widgets.layout) {
                result.widgets.layout = {}
              }

              result.widgets.layout[sectionId + instanceId + '_default'] = modifiers[modifierId]
            }

            result.widgets.content[itemId] = contentRefs
            result.content.value = { ...result.content.value, ...content.value }
            result.content.type = { ...result.content.type, ...content.type }
          }

          // add events
          if (item.events[i]) {
            const events = item.events[i]

            result.events = result.events || {}

            for (const key in events) {
              if (Object.hasOwnProperty.call(events, key)) {
                const event = events[key]
                const eventId = instanceId + '_' + key.padStart(4, '0') + '_' + event.on

                result.events[eventId] = event.action
              }
            }
          }

          // Is this set to default because of the depth?
          layout.default = { id: layoutId }

          if (!result.widgets.sections[sectionId]) {
            result.widgets.sections[sectionId] = [{ groupId, instanceId, layout }]
          } else {
            result.widgets.sections[sectionId].push({ groupId, instanceId, layout })
          }

          this.$method('dsWidget/setLoaded', { id: itemId, value: true })
        }
      }

      if (result.events) {
        this.$method('dsEvent/set', result.events)
      }

      // Set content
      if (result.content) {
        if (result.content.value) {
          this.$method('dsContent/setValues', result.content.value)
        }

        if (result.content.type) {
          this.$method('dsContent/setTypes', result.content.type)
        }
      }

      // Set widgets
      if (result.widgets) {
        if (result.widgets.sections) {
          this.$method('dsWidget/setSection', result.widgets.sections)
        }

        if (result.widgets.layout) {
          this.$method('dsWidget/setLayout', result.widgets.layout)
        }

        if (result.widgets.content) {
          const dsPageId = this.$method('dsRouter/getCurrentId')

          this.$method('dsWidget/setContent', { dsPageId, items: result.widgets.content })
        }
      }

      return [sectionId, layoutEntry, result]
    },
    _createContent (items, view, groupId, defaultContent = [], modifiers) {
      const contentRefs = []
      const content = {
        value: {},
        type: {}
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const [type, isPermanent] = item.type
        let id, exists

        if (defaultContent.length && isPermanent) {
          for (let i = 0; i < defaultContent.length; i++) {
            const contentId = defaultContent[i]
            const contentType = this.$method('dsContent/getType', contentId)

            if (type === contentType[0]) {
              id = contentId
              defaultContent.splice(i, 1)
              exists = true
              break
            }
          }
        } else {
          id = this.$method('dsUtilities/generateId')
        }

        contentRefs.push(id)

        if (!exists) {
          content.type[id] = [type, isPermanent]

          if (type === 'section') {
            const contentValue = {}

            for (let i = 0; i < item.value.length; i++) {
              const [lang, entry] = item.value[i]
              const [sectionId] = this.create({ entry, defaultContent, groupId, view, modifiers })

              contentValue[lang] = sectionId
            }

            content.value[id] = contentValue
          } else {
            content.value[id] = item.value
          }
        }
      }

      return [contentRefs, content, defaultContent]
    },
    _fetch (id) {
      return new Promise((resolve, reject) => {
        this.$action('dsDatabase/getOne', { collection: 'widgetTemplates', id },
          {
            onSuccess: (record) => {
              this.set({ id: record.id, item: record })
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
    set ({ id, item }) {
      this.entry[id] = item.templateEntry

      if (item.template) {
        this.items = { ...this.items, ...item.template }
      }

      if (item.modifiers) {
        this.modifiers[id] = item.modifiers
      }

      if (item.layouts) {
        this.$method('dsLayout/setItems', item.layouts.items)

        if (item.layouts.head) {
          this.$method('dsLayout/setHead', item.layouts.head)
        }
      }

      if (item.components) {
        this.$method('dsComponent/set', item.components)
      }
    }
  }
}

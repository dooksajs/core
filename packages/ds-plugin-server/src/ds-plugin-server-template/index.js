import { dsTemplate } from '@dooksa/ds-plugin'
import { definePlugin } from '@dooksa/ds-app'
import { getNodeValue } from '@dooksa/dom'
import { parseHTML } from '@dooksa/parse'
/**
 * DsPage plugin.
 * @namespace dsTemplate
 */
export default definePlugin({
  name: 'dsTemplate',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsTemplate.data
  },
  setup () {
    this.$seedDatabase('ds-template-items')

    // route: get a list of section
    this.$setWebServerRoute('/template', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsTemplate/items'])
      ]
    })

    // route: delete section
    this.$setWebServerRoute('/template', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsTemplate/items'])
      ]
    })
  },
  methods: {
    parseHTML ({ html, actions }) {
      const template = parseHTML(html, this.$componentGetters, this.$componentIgnoreAttr)

      for (let i = 0; i < template.content.length; i++) {
        const items = template.content[i]

        for (let j = 0; j < items.length; j++) {
          const node = items[j]
          const nodeName = node.nodeName.toLowerCase()
          const getters = this.$componentGetters[nodeName]
          let value = {}

          if (node.nodeName === '#text') {
            value = getNodeValue(getters[0].type, node, getters[0].name, 'value')
          } else {
            // get node value
            for (let i = 0; i < getters.length; i++) {
              const getter = getters[i]
              const result = getNodeValue(getter.type, node, getter.name, getter.contentProperty)

              value[result.key] = result.value
            }
          }

          items[j] = {
            item: value,
            type: this.$component(nodeName).type
          }
        }
      }

      // add layouts
      for (let i = 0; i < template.layout.length; i++) {
        const layout = template.layout[i]
        const layoutId = template.layoutId[i]

        this.$setDataValue('dsLayout/items', layout, {
          id: layoutId
        })
      }

      // store what event id's were used
      const eventActions = []

      // match action reference to events
      if (actions) {
        for (let i = 0; i < template.widgetEvent.length; i++) {
          const events = template.widgetEvent[i]

          for (const key in events) {
            if (Object.hasOwn(events, key)) {
              const event = events[key]

              for (let i = 0; i < event.value.length; i++) {
                const eventId = event.value[i]

                if (actions[eventId]) {
                  event.value[i] = actions[eventId]
                  eventActions.push(eventId)
                }
              }
            }
          }
        }
      }

      this.$setDataValue('dsComponent/items', template.component, {
        merge: true
      })

      const result = this.$setDataValue('dsTemplate/items', {
        content: template.content,
        layout: template.layout,
        layoutId: template.layoutId,
        widgetEvent: template.widgetEvent,
        widgetSection: template.widgetSection,
        section: template.section
      }, {
        id: template.id
      })

      return { id: result.id, mode: template.mode, eventActions }
    }
  }
})

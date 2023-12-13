import { dsTemplate } from '@dooksa/ds-plugin'
import { definePlugin, getNodeValue } from '@dooksa/utils'
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

      // Store used action collection
      template.actions = []

      for (let i = 0; i < template.content.length; i++) {
        const items = template.content[i]

        for (let j = 0; j < items.length; j++) {
          const node = items[j]
          const nodeName = node.nodeName.toLowerCase()
          const component = this.$component(nodeName)
          const getters = this.$componentGetters[nodeName]
          const content = {
            item: { values: {} },
            type: component.type
          }

          // get node value
          if (getters) {
            for (let i = 0; i < getters.length; i++) {
              const getter = getters[i]
              const result = getNodeValue(node, getter.type, getter.name, getter.token)

              content.item.values[getter.property] = result.value

              if (getter.token) {
                if (!content.item.tokens) {
                  content.item.tokens = {}
                }

                content.item.tokens[getter.property] = result.token
              }
            }
          }

          items[j] = content
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

      // Add used actions by widget
      if (template.widgetEvent) {
        for (let i = 0; i < template.widgetEvent.length; i++) {
          const events = template.widgetEvent[i]

          for (const key in events) {
            if (Object.hasOwnProperty.call(events, key)) {
              const event = events[key]

              for (let i = 0; i < event.value.length; i++) {
                const actionId = event.value[i]

                if (actions[actionId]) {
                  const action = actions[actionId]

                  this.$setDataValue('dsAction/blocks', action.blocks, { merge: true })
                  this.$setDataValue('dsAction/items', action.items[actionId], { id: actionId })
                  this.$setDataValue('dsAction/sequences', action.sequences, { merge: true })

                  template.actions.push({
                    blocks: Object.keys(action.blocks),
                    items: actionId,
                    sequences: Object.keys(action.sequences)
                  })
                }
              }
            }
          }
        }
      }

      for (let i = 0; i < template.computedAttributes.length; i++) {
        const computedAttributes = template.computedAttributes[i]
        const data = { uuid: {} }

        for (let j = 0; j < computedAttributes.length; j++) {
          const computedAttribute = computedAttributes[j]
          const componentId = template.layout[i][computedAttribute.index].componentId
          const component = template.component[componentId]

          if (!component.attributes) {
            component.attributes = []
          }

          for (let k = 0; k < computedAttribute.values.length; k++) {
            const attribute = computedAttribute.values[k]
            const result = this['_compute/' + attribute.value](data, attribute.arguments)

            component.attributes.push([attribute.name, result])
          }
        }
      }

      this.$setDataValue('dsComponent/items', template.component, {
        merge: true
      })

      const result = this.$setDataValue('dsTemplate/items', {
        queryIndexes: template.queryIndexes,
        contentRefs: template.contentRefs,
        sectionRefs: template.sectionRefs,
        actions: template.actions,
        content: template.content,
        layout: template.layout,
        layoutId: template.layoutId,
        widgetEvent: template.widgetEvent,
        widgetSection: template.widgetSection,
        section: template.section
      }, {
        id: template.id
      })

      return {
        id: result.id,
        mode: template.mode
      }
    },
    '_compute/uuid' (data, args = [0]) {
      const index = args[0]

      if (data[index]) {
        return data[index]
      }

      data[index] = this.$method('dsData/generateId')

      return data[index]
    }
  }
})

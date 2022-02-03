import { name, version } from '../ds.plugin.config'

/**
 * Dooksa event plugin.
 * @module plugin
 */
export default {
  name,
  version,
  dependencies: [
    {
      name: 'dsElement',
      version: 1
    },
    {
      name: 'dsContent',
      version: 1
    }
  ],
  data: {
    metadata: {},
    items: {}
  },
  methods: {
    create (context, { id, items, start = 0 }) {
      const components = []

      for (let i = start; i < items.length; i++) {
        const item = items[i]

        if (item.component) {
          const component = this.$method('dsElement/create', item.component)

          if (item.children) {
            for (let i = 0; i < item.children.length; i++) {
              const index = item.children[i]
              const childItem = items[index]

              if (childItem.content) {
                // normally we get the contentId from the widget
                this.$action('dsContent/subscribe', { id: 'content123', item: component })
              } else {
                const children = this.createLayout(id, items, index)

                for (let i = 0; i < children.length; i++) {
                  component.appendChild(children[i])
                }
              }
            }
          }

          components.push(component)
        }
      }

      return components
    }
  }
}

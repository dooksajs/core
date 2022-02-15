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
    content: {},
    children: {},
    items: {}
  },
  methods: {
    create (context, id) {
      const items = this._get(id)

      return this._render(items)
    },
    set (context, { id, items, content, children }) {
      this.children[id] = children
      this.items[id] = items
      this.content[id] = content
    },
    _content (id, index) {
      return this.content[id][index]
    },
    _get (id) {
      return {
        id,
        items: this.items[id],
        children: this.children[id]
      }
    },
    _render ({ id, items, children, childItems }) {
      const fragments = new window.DocumentFragment()

      for (let i = 0; i < children.length; i++) {
        const item = childItems ? childItems[children[i]] : items[children[i]]
        let component

        if (item.component.type === 'element') {
          component = this.$method('dsElement/create', item.component)
        } else {
          component = this.$method('dsElement/createNode', item.component.id)
        }

        if (item.children) {
          const sibling = this._sibling(items, item.children)
          const childComponent = this._render({
            id,
            items,
            children: sibling.children,
            childItems: sibling.items
          })
          component.appendChild(childComponent)
        } else {
          const content = this._content(id, item.content)

          this.$method('dsContent/subscribe', { id: content.id, item: component })
        }

        fragments.append(component)
      }

      return fragments
    },
    _sibling (items, indexes) {
      const newItems = {
        items: [],
        children: []
      }

      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i]

        newItems.items.push(items[index])
        newItems.children.push(i)
      }

      return newItems
    }
  }
}

import createPlugin from '@dooksa/create-plugin'
import {
  dataGetValue, dataSetValue
} from './data.js'

let iconifyAPIUrl = 'https://api.iconify.design'
const timeoutId = {}
const iconQueue = {}

const icon = createPlugin('icon', {
  metadata: {
    title: 'Icon',
    description: 'Additional information about plugins and their actions',
    icon: 'carbon:data-volume'
  },
  models: {
    items: {
      type: 'collection',
      items: { type: 'string' }
    },
    aliases: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'icon/items'
      }
    }
  },
  actions: {
    /**
     * Render icon
     * @param {object} param
     * @param {string} param.componentId
     */
    render ({ componentId }) {
      const component = dataGetValue({
        name: 'component/nodes',
        id: componentId
      })

      if (component.isEmpty) {
        throw new Error('Component does not exist')
      }

      const node = component.item

      // no icon
      if (!node.dataset.icon) {
        return
      }
      const id = node.dataset.icon
      const icon = dataGetValue({
        name: 'icon/items',
        id
      })

      // use cache icon
      if (!icon.isEmpty) {
        node.innerHTML = icon.item

        return
      } else {
        const aliasIcon = dataGetValue({
          name: 'icon/aliases',
          id,
          options: { extend: true }
        })

        if (!aliasIcon.isExpandEmpty) {
          node.innerHTML = aliasIcon.extend[0]

          return
        }
      }

      const [iconPrefix, iconId] = id.split(':')
      let currentIconQueue = iconQueue[iconPrefix]

      if (!currentIconQueue) {
        currentIconQueue = {
          icons: [],
          components: {}
        }

        iconQueue[iconPrefix] = currentIconQueue
      }

      // add icon to fetch query
      if (currentIconQueue.icons.indexOf(iconId) === -1) {
        currentIconQueue.icons.push(iconId)
      }

      currentIconQueue.components[componentId] = {
        node,
        iconId
      }

      // check if we are still processing queue
      if (timeoutId[iconPrefix]) {
        return
      }

      // set new queue
      timeoutId[iconPrefix] = setTimeout(() => {
        // clear "queue"
        delete timeoutId[iconPrefix]

        fetch(`${iconifyAPIUrl}/${iconPrefix}.json?icons=${currentIconQueue.icons.join(',')}`)
          .then(response => {
            if (response.ok) {
              return response.json()
            }
          })
          .then(data => {
            for (const key in currentIconQueue.components) {
              if (Object.prototype.hasOwnProperty.call(currentIconQueue.components, key)) {
                const component = currentIconQueue.components[key]
                let iconName = component.iconId
                let isAlias = false

                // check if id is an alias
                if (data.aliases && data.aliases[component.iconId]) {
                  isAlias = true
                  iconName = data.aliases[component.iconId].parent
                }

                // full icon id
                let id = iconPrefix + ':' + iconName

                // check if icon exists
                if (!data.icons[iconName]) {
                  continue
                }

                const value = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewbox="0 0 24 24">
                  ${data.icons[iconName].body}
                </svg>`

                dataSetValue({
                  name: 'icon/items',
                  value,
                  options: { id }
                })

                if (isAlias) {
                  // store icon alias
                  dataSetValue({
                    name: 'icon/aliases',
                    value: id,
                    options: { id: component.iconId }
                  })
                }

                // fade new icon
                component.node.classList.add('fade-in')
                // add svg icon
                component.node.innerHTML = value
              }
            }

            // clear icon queue
            delete iconQueue[iconPrefix]
          })
          .catch(error => {
            throw error
          })
      })
    }
  }
})

export { icon }

export default icon

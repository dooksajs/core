import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, stateSetValue } from '#client'

/**
 * @import {Component} from '@dooksa/create-component'
 * @import {IconQueueItem, IconData, IconComponentData, IconStateSchema} from '../../../types.js'
 */

/**
 * Iconify API base URL
 * @type {string}
 */
let iconifyAPIUrl = 'https://api.iconify.design'

/**
 * Timeout IDs for batch icon fetching (keyed by icon prefix)
 * @type {Object.<string, number>}
 */
const timeoutId = {}

/**
 * Queue of icons waiting to be fetched (keyed by icon prefix)
 * @type {Object.<string, IconQueueItem>}
 */
const iconQueue = {}

export const icon = createPlugin('icon', {
  metadata: {
    title: 'Icon',
    description: 'Icon management plugin for rendering icons from Iconify API with caching and batch fetching',
    icon: 'carbon:data-volume'
  },
  state: {
    schema: {
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
    }
  },
  actions: {
    render: {
      metadata: {
        title: 'Render icon',
        description: 'Fetch and render an icon from Iconify API with caching support',
        icon: 'mdi:icon'
      },
      parameters: {
        type: 'string'
      },
      /**
       * Render an icon for a component by fetching it from Iconify API or using cached data
       * @param {string} componentId - The ID of the component that needs an icon rendered
       * @throws {Error} - Throws error if component doesn't exist
       * @description
       * This method handles the complete icon rendering workflow:
       * 1. Checks if component exists
       * 2. Looks for icon data in cache (icon/items)
       * 3. Checks for icon aliases (icon/aliases)
       * 4. Queues icon for batch fetching if not cached
       * 5. Fetches from Iconify API and caches results
       * 6. Renders SVG icon with fade-in animation
       */
      method (componentId) {
        const component = stateGetValue({
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
        const icon = stateGetValue({
          name: 'icon/items',
          id
        })

        // use cache icon
        if (!icon.isEmpty) {
          node.innerHTML = icon.item

          return
        } else {
          const aliasIcon = stateGetValue({
            name: 'icon/aliases',
            id,
            options: { expand: true }
          })

          if (!aliasIcon.isExpandEmpty) {
            node.innerHTML = aliasIcon.expand[0].item

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

                  if (typeof data === 'number') {
                    if (data === 404) {
                      component.node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="none" stroke="#77767b" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4.01l.01-.011M9 3H4v3m0 5v2m16-2v2M15 3h5v3M9 21H4v-3m11 3h5v-3"/></svg>'

                      console.warn('DooksaWarning: could not find icon "' + id + '"')
                      continue
                    }
                  }

                  // check if icon exists
                  if (!data.icons[iconName]) {
                    continue
                  }

                  const value = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewbox="0 0 24 24">
                    ${data.icons[iconName].body}
                  </svg>`

                  stateSetValue({
                    name: 'icon/items',
                    value,
                    options: { id }
                  })

                  if (isAlias) {
                    // store icon alias
                    stateSetValue({
                      name: 'icon/aliases',
                      value: id,
                      options: {
                        id: iconPrefix + ':' + component.iconId
                      }
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
  }
})

export const { iconRender } = icon
export default icon

import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, eventEmit } from '#core'
import { hash } from '@dooksa/utils'

const pathHash = {}

// create hash
hash.init()

/**
 * Current pathname
 * @returns {string}
 */
function currentPath () {
  return window.location.pathname || '/'
}

/**
 * Hash current pathname
 * @returns {string}
 */
function currentId () {
  const path = currentPath()

  // check in path hash cache
  if (pathHash[path]) {
    return pathHash[path]
  }

  const target = currentPath()
  const id = '_' + hash.update(target) + '_'

  // cache id
  pathHash[path] = id

  return id
}

export const route = createPlugin('route', {
  metadata: {
    title: 'Route',
    description: 'Client side routing.',
    icon: 'mdi:router'
  },
  actions: {
    navigate: {
      metadata: {
        title: 'Navigate to',
        description: 'Change page by path.',
        icon: 'gis:route-end'
      },
      /**
       * @param {Object} param
       * @param {string} param.to
       */
      method ({ to }) {
        const from = currentPath()

        // exit if path is the same as current path
        if (to === from) {
          return
        }
        const fromSections = stateGetValue({
          name: 'page/items',
          id: from
        })
        const toSections = stateGetValue({
          name: 'page/items',
          id: to
        })

        if (toSections.isEmpty) {
          // get data
        }

        for (const sectionId in toSections.item) {
          if (Object.hasOwnProperty.call(toSections.item, sectionId)) {
            const toViewId = toSections.item[sectionId]
            const fromViewId = fromSections.item[sectionId]

            if (!fromViewId) {
              //
            } else if (fromViewId !== toViewId) {
              // viewDetach(fromViewId)
            }
          }
        }

        for (const sectionId in fromSections.item) {
          if (Object.hasOwnProperty.call(fromSections.item, sectionId)) {
            const toViewId = toSections.item[sectionId]
            const fromViewId = fromSections.item[sectionId]

            if (!toViewId) {
              // viewDetach(fromViewId)
            }
          }
        }

        // update history
        window.history.pushState({
          to,
          from
        }, '', to)
      }
    },
    currentPath: {
      metadata: {
        title: 'Current path',
        description: 'Current path name',
        icon: 'formkit:url'
      },
      method: currentPath
    },
    currentId: {
      metadata: {
        title: 'Current path ID',
        description: 'Hash current path name.',
        icon: 'mdi:hashtag'
      },
      method: currentId
    }
  },
  state: {
    schema: {
      sections: {
        type: 'collection',
        defaultId () {
          return currentId()
        },
        items: {
          type: 'object'
        }
      }
    }
  },
  setup () {
    window.addEventListener('popstate', (event) => {
      eventEmit({
        name: 'route/history',
        id: 'popstate',
        context: {},
        payload: {
          location: window.location,
          state: event.state
        }
      })
    })
  }
})

export const {
  routeCurrentId,
  routeCurrentPath,
  routeNavigate
} = route

export default route

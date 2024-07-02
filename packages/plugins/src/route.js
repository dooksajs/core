import createPlugin from '@dooksa/create-plugin'
import { $getDataValue } from './data.js'
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

const route = createPlugin('route', {
  metadata: {
    plugin: {
      title: 'Route',
      description: 'Client side routing.',
      icon: 'mdi:router'
    },
    actions: {
      navigate: {
        title: 'Navigate to',
        description: 'Change page by path.',
        icon: 'gis:route-end'
      },
      currentId: {
        title: 'Current path ID',
        description: 'Hash current path name.',
        icon: 'mdi:hashtag'
      },
      currentPath: {
        title: 'Current path',
        description: 'Current path name',
        icon: 'formkit:url'
      }
    }
  },
  actions: {
    /**
     * @param {Object} param
     * @param {string} param.to
     */
    navigate ({ to }) {
      const from = currentPath()

      // exit if path is the same as current path
      if (to === from) {
        return
      }
      const fromSections = $getDataValue('page/items', { id: from })
      const toSections = $getDataValue('page/items', { id: to })

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
      window.history.pushState({ to, from }, '', to)
    },
    currentPath,
    currentId
  },
  models: {
    sections: {
      type: 'collection',
      defaultId () {
        return currentId()
      },
      items: {
        type: 'object'
      }
    }
  },
  setup () {
    window.addEventListener('popstate', (event) => {
      console.log(
        `location: ${document.location}, state: ${JSON.stringify(event.state)}`
      )
    })
  }
})

const routeCurrentId = route.actions.currentId
const routeNavigate = route.actions.navigate
const routeCurrentPath = route.actions.currentPath

export {
  route,
  routeCurrentId,
  routeCurrentPath,
  routeNavigate
}

export default route

import { createPlugin } from '@dooksa/create'
import { $getDataValue } from './data.js'
import { viewDetach } from './view.js'
import { hash } from '@dooksa/utils'

const pathHash = {}

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

  // create hash
  hash.init()

  const target = currentPath()
  const id = '_' + hash.update(target).digest('hex') + '_'

  // cache id
  pathHash[path] = id

  return id
}

const router = createPlugin({
  name: 'router',
  actions: {
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
            viewDetach(fromViewId)
          }
        }
      }

      for (const sectionId in fromSections.item) {
        if (Object.hasOwnProperty.call(fromSections.item, sectionId)) {
          const toViewId = toSections.item[sectionId]
          const fromViewId = fromSections.item[sectionId]

          if (!toViewId) {
            viewDetach(fromViewId)
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

const routerCurrentId = router.actions.currentId
const routerNavigate = router.actions.navigate
const routerCurrentPath = router.actions.currentPath

export {
  routerCurrentId,
  routerCurrentPath,
  routerNavigate
}

export default router

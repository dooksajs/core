import { createPlugin } from '@dooksa/create-plugin'
import { viewDetach } from './view.js'
import { hash } from '@dooksa/utils'

const router = createPlugin('router', ({ defineData, defineActions, defineSetup }, { $getDataValue }) => {
  const router = defineActions({
    navigate ({ to }) {
      const from = this.currentPath()

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
    currentPath () {
      return window.location.pathname || '/'
    },
    currentId () {
      const path = this.currentPath()

      // check in path hash cache
      if (this.hash[path]) {
        return this.hash[path]
      }

      // create hash
      hash.init()

      const target = this.currentPath()
      const id = '_' + hash.update(target).digest('hex') + '_'

      // cache id
      this.hash[path] = id

      return id
    }
  })

  defineData({
    sections: {
      schema: {
        type: 'collection',
        defaultId () {
          return router.actions.currentId()
        },
        items: {
          type: 'object'
        }
      }
    }
  })

  defineSetup(() => {
    window.addEventListener('popstate', (event) => {
      console.log(
        `location: ${document.location}, state: ${JSON.stringify(event.state)}`
      )
    })
  })
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

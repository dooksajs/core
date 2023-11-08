import { definePlugin } from '@dooksa/ds-app'

/**
 * Dooksa widget plugin.
 * @namespace dsRouter
 */
export default definePlugin({
  name: 'dsRouter',
  version: 1,
  data: {
    sections: {
      schema: {
        type: 'collection',
        defaultId () {
          return this.$method('dsRouter/currentPath')
        },
        items: {
          type: 'object'
        }
      }
    }
  },
  setup () {
    window.addEventListener('popstate', (event) => {
      console.log(
        `location: ${document.location}, state: ${JSON.stringify(event.state)}`
      )
    })
    // window.addEventListener('popstate', () => {
    //   console.log(this.currentPath())
    //   // this._update(this.currentPath, this.currentPathname(), (state) => {
    //   //   this.$emit('dsRouter/navigate', {
    //   //     id: this.getCurrentId(),
    //   //     payload: state
    //   //   })
    //   // })
    // })
  },
  /** @lends dsRouter */
  methods: {
    navigate ({ to }) {
      const from = this.currentPath()

      // exit if path is the same as current path
      if (to === from) {
        return
      }
      const fromSections = this.$getDataValue('dsPage/items', { id: from })
      const toSections = this.$getDataValue('dsPage/items', { id: to })

      if (toSections.isEmpty) {
        // get data
      }

      for (const dsSectionId in toSections.item) {
        if (Object.hasOwn(toSections.item, dsSectionId)) {
          const toViewId = toSections.item[dsSectionId]
          const fromViewId = fromSections.item[dsSectionId]

          if (!fromViewId) {
            //
          } else if (fromViewId !== toViewId) {
            const dsWidgetViewId = this.$getDataValue('ds')
            this.$method('dsView/detach', fromViewId)
          }
        }
      }

      for (const dsSectionId in fromSections.item) {
        if (Object.hasOwn(fromSections.item, dsSectionId)) {
          const toViewId = toSections.item[dsSectionId]
          const fromViewId = fromSections.item[dsSectionId]

          if (!toViewId) {
            this.$method('dsView/detach', fromViewId)
          }
        }
      }

      // update history
      window.history.pushState({ to, from }, '', to)
    },
    currentPath () {
      return this.cleanPath(window.location.pathname) || '/'
    },
    cleanPath (value) {
      const text = value.toString().trim().toLocaleLowerCase('en-US')

      return text.replace(/[_,:;]/gi, '-')
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[+]/g, '-') // Replace + with '-'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
    }
  }
})

/**
 * Dooksa widget plugin.
 * @module plugin
 */
export default {
  name: 'dsRouter',
  version: 1,
  dependencies: [
    {
      name: 'dsEvent',
      version: 1
    }
  ],
  data: {
    path: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    currentPath: {
      private: true,
      default: ''
    },
    state: {
      private: true,
      default: {}
    },
    items: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  setup () {
    // set current path
    this.currentPath = this.currentPathname()

    window.addEventListener('popstate', () => {
      this._update(this.currentPath, this.currentPathname(), (state) => {
        this.$method('dsPage/updateDOM', state)
        this.$emit({
          id: this.getCurrentId(),
          on: 'dsRouter/navigate',
          payload: state
        })
      })
    })
  },
  methods: {
    getCurrentId () {
      const currentPathname = this.currentPathname()

      return this.items[currentPathname]
    },
    currentPathname () {
      return window.location.pathname
    },
    navigate (nextPath) {
      this._update(this.currentPathname(), nextPath, (state) => {
        // update history
        window.history.pushState(state, '', nextPath)
        // update current path
        this.currentPath = this.currentPathname()

        this.$method('dsPage/updateDOM', state)
        this.$emit({
          id: this.getCurrentId(),
          on: 'dsRouter/navigate',
          payload: state
        })
      })
    },
    cleanPath (value) {
      const text = value.toString().trim().toLocaleLowerCase('en-US')

      return text.replace(/[_,:;]/gi, '-')
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[+]/g, '-') // Replace + with '-'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
    },
    _update (prevPath, nextPath, callback = () => {}) {
      const state = {
        nextPath,
        prevPath,
        nextId: this.items[nextPath],
        prevId: this.items[prevPath]
      }
      // update current path
      this.currentPath = this.currentPathname()

      if (!state.nextId) {
        this.$action('dsPage/getOneByPath', {
          dsPagePath: this.cleanPath(nextPath)
        },
        {
          onSuccess: (data) => {
            state.nextId = data.id

            this.$method('dsPage/set', data)

            callback(state)
          }
        })
      } else {
        callback(state)
      }
    }
  }
}

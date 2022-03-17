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
    currentPath: '',
    state: {},
    searchParams: null,
    items: {},
    cleanUrlSet: [
      ['a', '[ÀÁÂÃÄÅÆĀĂĄẠẢẤẦẨẪẬẮẰẲẴẶ]'],
      ['c', '[ÇĆĈČ]'],
      ['d', '[ÐĎĐÞ]'],
      ['e', '[ÈÉÊËĒĔĖĘĚẸẺẼẾỀỂỄỆ]'],
      ['g', '[ĜĞĢǴ]'],
      ['h', '[ĤḦ]'],
      ['i', '[ÌÍÎÏĨĪĮİỈỊ]'],
      ['j', '[Ĵ]'],
      ['ij', '[Ĳ]'],
      ['k', '[Ķ]'],
      ['l', '[ĹĻĽŁ]'],
      ['m', '[Ḿ]'],
      ['n', '[ÑŃŅŇ]'],
      ['o', '[ÒÓÔÕÖØŌŎŐỌỎỐỒỔỖỘỚỜỞỠỢǪǬƠ]'],
      ['oe', '[Œ]'],
      ['p', '[ṕ]'],
      ['r', '[ŔŖŘ]'],
      ['s', '[ßŚŜŞŠ]'],
      ['t', '[ŢŤ]'],
      ['u', '[ÙÚÛÜŨŪŬŮŰŲỤỦỨỪỬỮỰƯ]'],
      ['w', '[ẂŴẀẄ]'],
      ['x', '[ẍ]'],
      ['y', '[ÝŶŸỲỴỶỸ]'],
      ['z', '[ŹŻŽ]'],
      ['-', '[·/_,:;\']']
    ]
  },
  setup () {
    // set current path
    this.currentPath = this.currentPathname()

    window.addEventListener('popstate', event => {
      this._update(this.currentPath, this.currentPathname(), (state) => {
        this.$action('dsEvent/emit', {
          id: this.name,
          name: 'navigate',
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
    getPathById (context, id) {
      return this.items[id]
    },
    currentPathname () {
      return window.location.pathname
    },
    set (context, item) {
      this.items = { ...this.items, ...item }
    },
    navigate (context, nextPath) {
      this._update(this.currentPathname(), nextPath, (state) => {
        // update history
        window.history.pushState(state, '', nextPath)
        // update current path
        this.currentPath = this.currentPathname()

        this.$action('dsEvent/emit', {
          id: this.name,
          name: 'navigate',
          payload: state
        })
      })
    },
    cleanPath (context, value) {
      let text = value.toString().toLowerCase().trim()

      text = this._replaceString(text)

      return text.replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[+]/g, '-') // Replace + with '-'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
    },
    _replaceString (text) {
      for (let i = 0; i < this.cleanUrlSet.length; i++) {
        const [to, from] = this.cleanUrlSet[i]

        text = text.replace(new RegExp(from, 'gi'), to)
      }

      return text
    },
    _update (prevPath, nextPath, callback) {
      const state = {
        nextPath,
        prevPath,
        nextId: this.items[nextPath],
        prevId: this.items[prevPath]
      }

      // update current path
      this.currentPath = this.currentPathname()

      if (!state.nextId) {
        const cacheFilename = this.$method('dsRouter/cleanPath', nextPath)

        this.$action('dsApp/fetch', cacheFilename, {
          onSuccess: (data) => {
            state.nextId = data.routes[nextPath]

            this.$method('dsApp/set', data)
            this.$method('dsApp/update', state)
            this.$action('dsEvent/emit', {
              id: this.name,
              name: 'navigate',
              payload: {
                value: state
              }
            })

            if (callback) {
              callback(state)
            }
          }
        })
      } else {
        this.$method('dsApp/update', state)
        this.$action('dsEvent/emit', {
          id: this.name,
          name: 'navigate',
          payload: {
            value: state
          }
        })

        if (callback) {
          callback(state)
        }
      }
    }
  }
}

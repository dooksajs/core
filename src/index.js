import { name, version } from '../ds.plugin.config'

/**
 * Dooksa widget plugin.
 * @module plugin
 */
export default {
  name,
  version,
  dependencies: [
    {
      name: 'dsEvent',
      version: 1
    }
  ],
  data: {
    id: 'base' + name.charAt(0).toUpperCase() + name.substring(1),
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
    window.addEventListener('popstate', event => {
      this._updateState()
      console.log(event.state, this.state)
      this.$method('dsApp/update', this.state)
      this.$action('dsEvent/emit', {
        id: this.id,
        name: 'navigate',
        payload: {
          value: this.currentPathname()
        }
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
      this._updateState()
    },
    navigate (context, nextPath) {
      const path = this.currentPathname()
      const prevId = this.items[path]
      let nextId = this.items[nextPath]

      if (!nextId) {
        const cacheFilename = this.$method('dsRouter/cleanPath', nextPath)

        this.$action('dsApp/fetch', cacheFilename, {
          onSuccess: (data) => {
            nextId = data.routes[nextPath]

            this.$method('dsApp/set', data)
            this.$method('dsApp/update', { prevId, nextId })
            window.history.pushState({ prevId, nextId }, '', nextPath)
            this._updateState()
            this.$action('dsEvent/emit', {
              id: this.id,
              name: 'navigate',
              payload: this.state
            })
          },
          onError: (e) => {
            console.error(e)
          }
        })
      } else {
        this.$method('dsApp/update', { prevId, nextId })
        window.history.pushState({ prevId, nextId }, '', nextPath)
        this._updateState()
      }
    },
    cleanPath (context, value) {
      let text = value.toString().toLowerCase().trim()

      text = this._replaceString(text)

      return text.replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[+]/g, '-') // Replace + with '-'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
    },
    _updateState () {
      const nextPath = this.currentPathname()

      if (this.state.nextPath !== nextPath) {
        this.state.prevPath = this.state.nextPath
        this.state.prevId = this.state.nextId
        this.state.nextPath = nextPath
        this.state.nextId = this.getCurrentId()
      }
    },
    _replaceString (text) {
      for (let i = 0; i < this.cleanUrlSet.length; i++) {
        const [to, from] = this.cleanUrlSet[i]

        text = text.replace(new RegExp(from, 'gi'), to)
      }

      return text
    }
  }
}

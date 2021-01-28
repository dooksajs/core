export default () => ({
  name: 'ui-avatar',
  version: '1.0.0',
  data: {
    api: 'https://eu.ui-avatars.com/'
  },
  methods: {
    createUrl (params) {
      const url = new URL(this.api)
      const searchParams = url.searchParams

      for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
          const value = params[key]

          if (value) {
            params.append(key, value)
          }
        }
      }

      url.search = searchParams.toString()

      return url.toString()
    },
    generate (url) {
      return window.fetch(url)
        .then(response => {
          return response.blob()
        })
        .then(blob => {
          return URL.createObjectURL(blob)
        })
    }
  }
})

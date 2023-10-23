import dsApp from '../src/index.js'

dsApp.start({
  isDev: true,
  options: [
    {
      name: 'dsWebServer',
      setup: {
        cookieSecret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    },
    {
      name: 'dsUser',
      setup: {
        secret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    }
  ]
}, {
  onSuccess (app) {
    app.$method('dsWebServer/start')
  },
  onError (error) {
    console.log(error)
  }
})

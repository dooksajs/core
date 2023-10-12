import dsApp from '../src/index.js'
import logger from 'sequelize-pretty-logger'

const app = dsApp.start({
  isDev: true,
  options: [
    {
      name: 'dssWebServer',
      setup: {
        cookieSecret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    },
    {
      name: 'dssDatabase',
      setup: {
        logging: logger()
      }
    },
    {
      name: 'dssUser',
      setup: {
        secret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    }
  ]
})
    app.$action('dssWebServer/start')
    app.$action('dssDatabase/start')

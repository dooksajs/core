import dsApp from '../src/index.js'
import dsDevTool from '@dooksa/ds-plugin-devtool'
import logger from 'sequelize-pretty-logger'

dsApp.use([{
  name: dsDevTool.name,
  version: dsDevTool.version,
  value: dsDevTool
}])

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

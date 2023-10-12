import dsApp from '../src/index.js'
import logger from 'sequelize-pretty-logger'

const app = dsApp.start({
  isDev: true,
  options: [
    {
      name: 'dsWebServer',
      setup: {
        cookieSecret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    },
    {
      name: 'dsDatabase',
      setup: {
        storage: './ds_data/database.db',
        logging: logger()
      }
    },
    {
      name: 'dsUser',
      setup: {
        secret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    }
  ]
})

app.$action('dsWebServer/start')
app.$action('dsDatabase/start', { force: true })

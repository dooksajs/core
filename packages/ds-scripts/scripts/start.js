import path from 'path'
import { readFileSync, existsSync } from 'fs'
import { appDirectory } from '../utils/paths.js'
import dsApp from '@dooksa/ds-app-server'
import dsConfig from '#production/ds-config.js'

const prodDirectory = path.resolve(appDirectory, 'app', 'production')
const dsAppClientPath = path.resolve(prodDirectory, 'public', 'index.js')
const dsCssClientPath = path.resolve(prodDirectory, 'css', 'styles.css')

if (!existsSync(dsAppClientPath)) {
  throw new Error('dsApp is missing, run the "build" script and try again.')
}

let dsCSS

if (existsSync(dsCssClientPath)) {
  dsCSS = readFileSync(dsCssClientPath)
} else {
  console.warn('No CSS found')
}

const dsAppClient = readFileSync(dsAppClientPath)

dsApp.start({
  isDev: false,
  options: [
    {
      name: 'dsDatabase',
      setup: {
        storage: path.resolve(prodDirectory, 'ds_data')
      }
    },
    {
      name: 'dsWebServer',
      setup: {
        cookieSecret: dsConfig.cookieSecret,
        publicPath: path.resolve(prodDirectory, 'public')
      }
    },
    {
      name: 'dsPage',
      setup: {
        dsCSS,
        dsApp: dsAppClient
      }
    },
    {
      name: 'dsUser',
      setup: {
        secret: dsConfig.secret
      }
    },
    {
      name: 'dsPage',
      setup: {
        dsApp: dsAppClient,
        dsCSS
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

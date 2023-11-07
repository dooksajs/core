import path from 'path'
import esbuild from 'esbuild'
import { appDirectory, scriptDirectory } from '../utils/paths.js'
import dsApp from '@dooksa/ds-app-server'
import { dsDevelopmentServer } from '@dooksa/ds-plugin-server'
import chalk from 'chalk'
import getUserLocale from 'get-user-locale'

const log = console.log
const lang = getUserLocale()

const devDirectory = path.resolve(appDirectory, 'app', 'development')
const buildDirectory = path.resolve(scriptDirectory, 'entry', 'dev')
const dsAppClientEntryPoint = path.resolve(buildDirectory, 'ds-app-client.js')
const outfile = path.resolve(buildDirectory, 'build', 'ds-app-client.js')
let dsAppServer

const dsRebuildClientPlugin = {
  name: 'dsRebuildClient',
  setup (build) {
    let timerStart
    let rebuildClientNum = 0

    build.onStart(() => {
      timerStart = performance.now()
    })

    build.onEnd(result => {
      const timer = performance.now() - timerStart

      log(
        Intl.DateTimeFormat(lang, {
          dateStyle: 'short',
          timeStyle: 'short'
        }).format(new Date()) +
        ' ' +
        chalk.magenta('[dooksa]') +
        chalk.green(' client built in: ') +
        chalk.blue(Math.floor(timer) + ' ms')
      )

      if (result.errors.length) {
        return { errors: result.errors }
      }

      if (result.outputFiles.length) {
        // set app script
        dsAppServer.$method('dsPage/setApp', result.outputFiles[0].text)

        // notify sse to reload
        dsAppServer.$setDataValue('dsDevelopment/rebuildClient', ++rebuildClientNum)
      }
    })
  }
}

const ctx = await esbuild.context({
  entryPoints: [dsAppClientEntryPoint],
  bundle: true,
  outfile,
  format: 'esm',
  sourcemap: 'inline',
  platform: 'browser',
  write: false,
  legalComments: 'none',
  minify: true,
  reserveProps: /__d__/,
  plugins: [dsRebuildClientPlugin]
})

await ctx.watch()

dsApp.use([{
  name: dsDevelopmentServer.name,
  version: dsDevelopmentServer.version,
  value: dsDevelopmentServer
}])

dsApp.start({
  isDev: true,
  options: [
    {
      name: 'dsDatabase',
      setup: {
        storage: path.resolve(devDirectory, 'ds_data')
      }
    },
    {
      name: 'dsWebServer',
      setup: {
        cookieSecret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c',
        publicPath: path.resolve(devDirectory, 'public')
      }
    },
    {
      name: 'dsUser',
      setup: {
        secret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c'
      }
    },
    {
      name: 'dsPage',
      setup: {
        dsApp
      }
    }
  ]
}, {
  onSuccess (app) {
    app.$method('dsWebServer/start')

    dsAppServer = app
  },
  onError (error) {
    console.log(error)
  }
})

import path from 'path'
import esbuild from 'esbuild'
import { appDirectory, scriptDirectory } from '../utils/paths.js'
import dsApp from '@dooksa/ds-app-server'
import { dsEsbuild, dsTemplateBuild } from '@dooksa/ds-plugin-server'
import chalk from 'chalk'
const log = console.log
const devDirectory = path.resolve(appDirectory, 'app')
const buildDirectory = path.resolve(scriptDirectory, 'entry', 'dev')
const dsAppClientEntryPoint = path.resolve(buildDirectory, 'ds-app-client.js')
const outfile = path.resolve(buildDirectory, 'build', 'ds-app-client.js')
let dsAppServer

dsApp.use([
  {
    name: dsEsbuild.name,
    version: dsEsbuild.version,
    value: dsEsbuild
  },
  {
    name: dsTemplateBuild.name,
    version: dsTemplateBuild.version,
    value: dsTemplateBuild
  }
])

dsApp.start({
  isDev: true,
  options: [
    {
      name: 'dsDatabase',
      setup: {
        storage: path.resolve(devDirectory, '.ds_snapshots')
      }
    },
    {
      name: 'dsWebServer',
      setup: {
        cookieSecret: 'RTRe50oe-wX8gd9qzrWUY71W4yGob10c',
        publicPath: path.resolve(devDirectory, 'assets')
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
    },
    {
      name: 'dsTemplateBuild',
      setup: {
        buildDir: path.resolve(devDirectory, 'widgets')
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
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      log(
        chalk.grey(`${hours}:${minutes}:${seconds} `) +
        chalk.white('Message:') +
        chalk.green(' Client built in: ') +
        chalk.blue(Math.floor(timer) + ' ms')
      )

      if (result.errors.length) {
        return { errors: result.errors }
      }

      if (result.outputFiles.length) {
        // set app script
        dsAppServer.$method('dsPage/setApp', result.outputFiles[0].text)

        // notify sse to reload
        dsAppServer.$setDataValue('dsEsbuild/rebuildClient', ++rebuildClientNum)
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
  minify: false,
  reserveProps: /__d__/,
  plugins: [dsRebuildClientPlugin]
})

await ctx.watch()

import app from '@dooksa/server'
import { development } from '@dooksa/plugins-server'
import { dataSetValue } from '@dooksa/plugins'
import esbuild from 'esbuild'
import chokidar from 'chokidar'
import logger from './logger.js'
import { resolve, extname } from 'node:path'

app.usePlugin(development)

// setup server
app.setup({
  options: {
    database: {
      storage: './app/.ds_snapshots/development'
    }
  }
})

/**
 * @TODO Watch templates/css and server dir for changes
 */

const devDirectory = resolve('./app')
const appClientEntryPoint = resolve('./src/client-app.js')

esbuild.context({
  entryPoints: [appClientEntryPoint, resolve(devDirectory, 'assets', 'styles.css')],
  bundle: true,
  outdir: devDirectory,
  format: 'esm',
  sourcemap: 'inline',
  write: false,
  minify: false,
  dropLabels: ['PROD'],
  reserveProps: /__d__/,
  plugins: [{
    name: 'rebuildClient',
    setup (build) {
      let timerStart
      let rebuildClientNum = 0

      build.onStart(() => {
        timerStart = performance.now()
      })

      build.onEnd(result => {
        if (result.errors.length) {
          return { errors: result.errors }
        }

        const timer = performance.now() - timerStart

        logger('Client built in:', timer)

        if (result.outputFiles.length) {
          // set app script
          for (let i = 0; i < result.outputFiles.length; i++) {
            const file = result.outputFiles[i]
            const fileExtension = extname(file.path)

            if (fileExtension === '.js') {
              dataSetValue({
                name: 'page/app',
                value: result.outputFiles[i].text
              })
            }
          }

          // notify sse to reload
          dataSetValue({
            name: 'development/rebuildClient',
            value: ++rebuildClientNum
          })
        }
      })
    }
  }]
})
  .then(ctx => {
    ctx.watch()
  })

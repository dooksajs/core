import app from '@dooksa/app/server'
import { development } from '@dooksa/plugins/server'
import { dataSetValue } from '@dooksa/plugins/client'
import esbuild from 'esbuild'
import chokidar from 'chokidar'
import logger from './logger.js'
import { resolve, extname, parse } from 'node:path'

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
  sourcemap: 'external',
  write: false,
  minify: false,
  dropLabels: ['PROD'],
  reserveProps: /__ds/,
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

        if (result.outputFiles.length) {
          // set app script
          for (let i = 0; i < result.outputFiles.length; i++) {
            const file = result.outputFiles[i]
            const fileExtension = extname(file.path)

            if (fileExtension === '.js') {
              dataSetValue({
                name: 'page/app',
                value: file.text
              })
            } else if (fileExtension === '.map') {
              const filename = parse(file.path)

              if (filename.name === 'client-app.js') {
                dataSetValue({
                  name: 'page/sourcemap',
                  value: file.text,
                  options: {
                    id: filename.base
                  }
                })
              }
            }
          }

          // notify sse to reload
          dataSetValue({
            name: 'development/rebuildClient',
            value: ++rebuildClientNum
          })

          logger('Client built in:', timer)
        }
      })
    }
  }]
})
  .then(ctx => {
    ctx.watch()
  })

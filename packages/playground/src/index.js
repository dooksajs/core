import app from '../../server/src/index.js'
import { development, templateBuild } from '../../server-plugins/src/index.js'
import { $setDataValue } from '@dooksa/plugins'
import esbuild from 'esbuild'
import chokidar from 'chokidar'
import logger from './logger.js'
import { resolve, extname } from 'node:path'

app.use(development)
app.use(templateBuild)

// setup server
app.setup({
  options: {
    database: {
      storage: './app/.ds_snapshots/development'
    }
  },
  loader: (filename) => {
    return new Promise((resolve, reject) => {
      import(`./app/plugins/${filename}.js`)
        .then(({ default: plugin }) => {
          resolve(plugin)
        })
        .catch(error => reject(error))
    })
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
  platform: 'browser',
  write: false,
  legalComments: 'none',
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
              $setDataValue('page/app', result.outputFiles[i].text)
            }
          }

          // notify sse to reload
          $setDataValue('development/rebuildClient', ++rebuildClientNum)
        }
      })
    }
  }]
})
  .then(ctx => {
    ctx.watch()
  })

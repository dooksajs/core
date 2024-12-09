import createAppServer from './app-server.js'
import { stateSetValue } from '@dooksa/plugins/client'
import esbuild from 'esbuild'
import { log } from '@dooksa/utils/server'
import { resolve, extname } from 'node:path'

// start server
const server = createAppServer({
  database: {
    storage: './app/.ds_snapshots'
  },
  http: {
    assets: {
      directory: resolve('./app/assets'),
      path: '/assets'
    }
  }
})

server
  .then(() => {
    const devDirectory = resolve('./app')
    const appClientEntryPoint = resolve('./src/app-client.js')

    esbuild.context({
      entryPoints: [appClientEntryPoint, resolve(devDirectory, 'assets', 'styles.css')],
      bundle: true,
      outdir: devDirectory,
      format: 'esm',
      write: false,
      minify: false,
      dropLabels: ['PROD'],
      reserveProps: /__ds/,
      plugins: [{
        name: 'rebuildClient',
        setup (build) {
          build.onEnd(result => {
            if (result.errors.length) {
              return { errors: result.errors }
            }

            if (result.outputFiles.length) {
              // set app script
              for (let i = 0; i < result.outputFiles.length; i++) {
                const file = result.outputFiles[i]
                const fileExtension = extname(file.path)

                if (fileExtension === '.js') {
                  stateSetValue({
                    name: 'page/app',
                    value: file.text
                  })
                }
              }
            }
          })
        }
      }]
    })
      .then(ctx => {
        ctx.watch()
      })
  })
  .catch(error => {
    log({
      level: 'ERROR',
      message: error.message
    })
  })

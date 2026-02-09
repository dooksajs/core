import createAppServer from './app-server.js'
import { stateSetValue } from '@dooksa/plugins/core'
import esbuild from 'esbuild'
import { log } from '@dooksa/utils/server'
import { resolve, extname, parse } from 'node:path'

// start server
const server = createAppServer({
  database: {
    storage: './app/.ds_snapshots/development'
  },
  server: {
    assets: {
      directory: resolve('./app/assets'),
      path: '/assets'
    }
  }
})

server
  .then(info => {
    log({
      message: '✨ Dooksa!',
      context: info.hostname + ':' + info.port
    })

    const devDirectory = resolve('./app')
    const appClientEntryPoint = resolve('./src/app-client.js')

    esbuild.context({
      entryPoints: [appClientEntryPoint, resolve(devDirectory, 'assets', 'styles.css')],
      bundle: true,
      outdir: devDirectory,
      format: 'esm',
      sourcemap: 'external',
      write: false,
      minify: false,
      target: ['es2020'],
      dropLabels: ['PROD', 'TEST'],
      reserveProps: /__ds/,
      plugins: [{
        name: 'rebuildClient',
        setup (build) {
          let timerStart
          let rebuild = 0

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
                  stateSetValue({
                    name: 'page/app',
                    value: file.text
                  })
                } else if (fileExtension === '.map') {
                  const filename = parse(file.path)

                  if (filename.name === 'app-client.js') {
                    stateSetValue({
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
              stateSetValue({
                name: 'development/rebuild',
                value: ++rebuild
              })

              log({
                message: 'Client built in',
                duration: timer
              })
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
      message: error.message,
      context: error.stack
    })
  })

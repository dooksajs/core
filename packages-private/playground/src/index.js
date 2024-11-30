import nodemon from 'nodemon'
import { resolve } from 'node:path'
import { log } from '@dooksa/utils/server'

nodemon({
  script: 'src/esbuild.js',
  ext: 'js',
  watch: [
    resolve('../plugins/src/server'),
    resolve('../actions/src')
  ],
  ignore: [
    '.git',
    'node_modules/**/node_modules',
    '*.spec.js'
  ]
})

let restarting = false

nodemon
  .on('start', function () {
    log({ message: 'Starting development server...' })
  })
  .on('quit', function () {
    console.log('all it quits')
    log({
      level: 'WARN',
      message: 'Stop development server...'
    })
    process.exit()
  })
  .on('restart', function (files) {
    // force restart on first file change
    if (!restarting && files) {
      restarting = true
      nodemon.restart()
      restarting = false

      log({
        level: 'WARN',
        message: 'Restarting process due to file change',
        context: files.toString()
      })
    }
  })
  .on('crash', function (error) {
    log({
      level: 'ERROR',
      message: 'Development server crashed...',
      context: error
    })
  })


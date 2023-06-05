import { resolve } from 'path'
import { existsSync } from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'
import basicSsl from '@vitejs/plugin-basic-ssl'
import cypress from 'cypress'
import dotenv from 'dotenv'
const args = process.argv.slice(2)

dotenv.config({ path: resolve(appDirectory, '.env') })

/**
 * Exit if spec file does not exists
 * @param {string} file spec file name
 */
function checkIfSpecExists (file) {
  if (!existsSync(resolve(appDirectory, 'cypress', 'e2e', file))) {
    console.log(`Spec file does not exist: ${file}`)
    process.exit(0)
  }
}

/**
 * Close vite (express) server
 * @param {object} server
 */
function closeServer (server) {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) {
          console.error('Server failed to exit')
          reject(err)
        }
        console.log('Server closed successfully')
        resolve(err)
      })
    } else {
      resolve(0)
    }
  })
}

;(async () => {
  const plugins = [basicSsl()]
  const resolveConfig = {}
  let specFile
  let root
  // server port
  const port = 1337
  const baseUrl = 'https://localhost:' + port

  if (args.includes('--lib')) {
    specFile = 'spec.cy.js'
    root = resolve(appDirectory, 'src')
  } else {
    // setup vite server to run integration tests
    specFile = 'ds-plugin.cy.js'

    const configPath = resolve(appDirectory, 'ds.config.js')

    root = resolve(scriptDirectory, 'entry', 'dev')
    plugins.push(dsHtmlLoader)

    resolveConfig.alias = {
      '@dooksa/plugin': resolve(appDirectory, 'src', 'index.js'),
      dsConfig: resolve(scriptDirectory, 'utils', 'emptyExport')
    }

    // check if absolute path exists
    if (existsSync(configPath)) {
      resolveConfig.alias.dsConfig = configPath
    }
  }

  const server = await createServer({
    root,
    plugins,
    server: { port, https: true },
    resolve: resolveConfig
  })

  // exit if spec file does not exists
  checkIfSpecExists(specFile)

  // cypress config
  const config = {
    spec: resolve(appDirectory, 'cypress', 'e2e', specFile),
    configFile: resolve(scriptDirectory, 'cypress.config.js'),
    config: {
      e2e: {
        baseUrl,
        supportFile: false
      }
    }
  }

  // add record option
  if (args.includes('--record')) {
    let CYPRESS_RECORD_KEY

    if (!dotenv.error) {
      // local key
      CYPRESS_RECORD_KEY = process.env.CYPRESS_RECORD_KEY
    } else {
      // pipeline key
      CYPRESS_RECORD_KEY = process.env['$CYPRESS_RECORD_KEY'] // eslint-disable-line
    }

    if (!CYPRESS_RECORD_KEY) {
      console.error('Cypress record key environment variable "$CYPRESS_RECORD_KEY" is empty or incorrect')
      process.exit(1)
    }

    config.record = true
    config.key = CYPRESS_RECORD_KEY
    config.ciBuildId = process.env.CYPRESS_BUILD_ID || process.env['$CYPRESS_BUILD_ID'] // eslint-disable-line
  }

  await server.listen()

  let cypressRuntime = 'run'

  if (args.includes('--open')) {
    cypressRuntime = 'open'
    // cypress config
    config.project = resolve(appDirectory)
    config.browser = 'firefox'
    config.testingType = 'e2e'
  }

  // run cypress
  cypress[cypressRuntime](config)
    .then((result) => {
      closeServer(server)
        .then(() => {
          if (result.failures) {
            console.error('Could not execute tests')
            console.error(result.message)
            console.log(result.failures)
            process.exit(result.failures)
          }

          // print test results and exit
          // with the number of failed tests as exit code
          console.log(result.totalFailed)
          process.exit(result.totalFailed)
        })
        .catch(() => process.exit(1))
    })
    .catch((err) => {
      closeServer(server)
        .then(() => {
          console.error(err.message)
          process.exit(1)
        })
        .catch(() => process.exit(1))
    })
})()

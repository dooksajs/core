import path from 'path'
import fs from 'fs'
import { scriptDirectory, appDirectory } from '../utils/paths.js'
import { createServer } from 'vite'
import getTemplates from '../utils/getTemplates.js'
import getDependencies from '../utils/getDependencies.js'
import dsHtmlLoader from '../plugin/vite-plugin-ds-html-loader.js'
import cypress from 'cypress'
import dotenv from 'dotenv'
const args = process.argv.slice(2)

dotenv.config({ path: path.join(appDirectory, '.env') })
/**
 * Exit if spec file does not exists
 * @param {string} file spec file name
 */
function checkIfSpecExists (file) {
  if (!fs.existsSync(path.join(appDirectory, 'cypress', 'e2e', file))) {
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
  // setup vite server to run integration tests
  const specFile = 'ds-plugin.cy.js'

  // exit if spec file does not exists
  checkIfSpecExists(specFile)

  // fetch plugins metadata
  let { default: { templateDir, devDependencies } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))

  templateDir = templateDir ? path.join(appDirectory, templateDir) : path.join(appDirectory, 'src/templates')

  const dsTemplates = await getTemplates(templateDir)
  const dsDevDependencies = await getDependencies(devDependencies)

  // server h4x0r port
  const port = 1337
  const baseUrl = 'http://localhost:' + port

  const server = await createServer({
    root: path.resolve(scriptDirectory, 'entry', 'test'),
    plugins: [
      dsHtmlLoader()
    ],
    server: { port },
    resolve: {
      alias: {
        '@dooksa/plugin': path.resolve(appDirectory, 'src', 'index.js'),
        dsDependencies: dsDevDependencies,
        dsTemplates
      }
    }
  })

  // cypress config
  const config = {
    spec: path.resolve(appDirectory, 'cypress', 'e2e', specFile),
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
  }

  await server.listen()

  let cypressRuntime = 'run'

  if (args.includes('--open')) {
    cypressRuntime = 'open'
    // cypress config
    config.project = path.resolve(appDirectory)
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

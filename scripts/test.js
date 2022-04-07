const cypress = require('cypress')
const express = require('express')
const fs = require('fs')
const path = require('path')
const { appDirectory, scriptDirectory } = require(path.resolve(__dirname, '../utils/paths.js'))
const dotenv = require('dotenv').config({ path: path.join(appDirectory, '.env')})
const app = express()
const args = process.argv.slice(2)
const port = 7078
let server = null
let specFile = 'ds-plugin.spec.js'

/**
 * Exit if spec file does not exists
 * @param {string} file spec file name
 */
function checkIfSpecExists (file) {
  if (!fs.existsSync(path.join(appDirectory, 'cypress', 'integration', file))) {
    console.log(`Spec file does not exist: ${file}`)
    process.exit(0)
  }
}

/**
 * Close express server
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
        console.log('Test app closed')
        resolve(err)
      })
    } else {
      resolve(0)
    }
  })
}

// cypress config
const config = {
  spec: path.join(appDirectory, 'cypress', 'integration', specFile),
  configFile: path.join(appDirectory, 'cypress.json'),
}

// Setup express server to run integration tests
if (args.includes('--e2e')) {
  specFile = 'ds-plugin.e2e.spec.js'
  // Exit if spec file does not exists
  checkIfSpecExists(specFile)
  // update cypress config
  config.config = { baseUrl: 'http://localhost:' + port }
  // Start server
  app.use(express.static(path.join(scriptDirectory, 'test')))
  app.use('/test', express.static(path.join(appDirectory, 'test')))

  server = app.listen(port, () => {
    console.log(`Test app listening on port ${port}`)
  })
} else {
  checkIfSpecExists(specFile)
}

// Add record option
if (args.includes('--record')) {
  let CYPRESS_RECORD_KEY

  if (!dotenv.error) {
    // local key
    CYPRESS_RECORD_KEY = process.env.CYPRESS_RECORD_KEY
  } else {
    // pipeline key
    CYPRESS_RECORD_KEY = process.env['$CYPRESS_RECORD_KEY']
  }

  if (!CYPRESS_RECORD_KEY) {
    console.error('Cypress record key environment variable "$CYPRESS_RECORD_KEY" is empty or incorrect')
    process.exit(1)
  }

  config.record = true
  config.key = CYPRESS_RECORD_KEY
}

// Run cypress test
cypress.run(config)
  .then((result) => {
    closeServer(server)
      .then(() => {
        if (result.failures) {
          console.error('Could not execute tests')
          console.error(result.message)
          process.exit(result.failures)
        }

        // print test results and exit
        // with the number of failed tests as exit code
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

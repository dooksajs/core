const cypress = require('cypress')
const express = require('express')
const fs = require('fs')
const path = require('path')
const { appDirectory, scriptDirectory } = require(path.resolve(__dirname, '../utils/paths.js'))

const app = express()
const args = process.argv.slice(2)
const port = 7078
const config = {}
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
  server.close((err) => {
    console.log('Test app closed')
    process.exit(err ? 1 : 0)
  })
}

// Setup express server to run integration tests
if (args.includes('--e2e')) {
  specFile = 'ds-plugin.e2e.spec.js'
  // Exit if spec file does not exists
  checkIfSpecExists(specFile)
  // Start server
  config.baseUrl = 'http://localhost:' + port
  app.use(express.static(path.join(scriptDirectory, 'test')))
  app.use('/test', express.static(path.join(appDirectory, 'test')))

  server = app.listen(port, () => {
    console.log(`Test app listening on port ${port}`)
  })
} else {
  checkIfSpecExists(specFile)
}

// Run cypress test
cypress.run({
  spec: path.join(appDirectory, 'cypress', 'integration', specFile),
  config,
  configFile: path.join(appDirectory, 'cypress.json'),
  record: args.includes('--record')
})
  .then(() => {
    if (server) {
      closeServer(server)
    }
  })
  .catch((err) => {
    if (server) {
      closeServer(server)
    }
    console.error(err)
  })

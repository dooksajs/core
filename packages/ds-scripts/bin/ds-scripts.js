#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)
const scriptName = args[args.length - 1]

/**
 * Fetch scripts
 */
const scripts = {
  dev: true,
  build: true,
  test: true,
  dispatch (scriptName) {
    import('../scripts/' + scriptName + '.js')
      .catch(e => console.log(e))
  }
}

if (scripts[scriptName]) {
  scripts.dispatch(scriptName)
}

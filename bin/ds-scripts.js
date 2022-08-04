#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)
const scriptName = args[args.length - 1]

/**
 * Fetch scripts
 */
const scripts = {
  test: true,
  dev: true,
  build: true,
  lint: true,
  update: true,
  dispatch (scriptName) {
    require('../scripts/' + scriptName)
  }
}

if (scripts[scriptName]) {
  scripts.dispatch(scriptName)
}

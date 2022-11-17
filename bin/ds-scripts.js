#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)
const scriptName = args[args.length - 1]

/**
 * Fetch scripts
 */
const scripts = {
  // test: true,
  dev: true,
  build: true,
  build_lib: true,
  test: true,
  // lint: true,
  // update: true,
  dispatch (scriptName) {
    import('../scripts/' + scriptName + '.js')
      .catch(e => console.log(e))
  }
}

if (scripts[scriptName]) {
  scripts.dispatch(scriptName)
}

'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

const createHash = require('../utils/createHash.js')
const webpack = require('webpack')
const webpackConfig = require('../webpack.prod.config.js')

const compiler = webpack(webpackConfig)

compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err)
  }
  console.log('Plugin compiled.')
  // create hash from plugin
  createHash()
})

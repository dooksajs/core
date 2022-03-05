'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

const webpack = require('webpack')
const webpackConfig = require('../webpack.dev.config.js')
const WebpackDevServer = require('webpack-dev-server')

const compiler = webpack(webpackConfig)
const devServerOptions = { ...webpackConfig.devServer, open: true }
const server = new WebpackDevServer(devServerOptions, compiler)

const runServer = async () => {
  console.log('Starting server...')
  await server.start()
}

runServer()

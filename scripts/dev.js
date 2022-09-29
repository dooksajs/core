'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

import webpackConfig from '../webpack.dev.config.js'
import { createRequire } from 'module'
import path from 'path';
import { appDirectory } from '../utils/paths.js'

const { default: { hasTemplates } } = await import(path.join(appDirectory, 'ds.plugin.config.js'))
const require = createRequire(import.meta.url);
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

if (hasTemplates) {
  // await import('./build_template.js')
}

const compiler = webpack(webpackConfig)
const devServerOptions = { ...webpackConfig.devServer, open: true }
const server = new WebpackDevServer(devServerOptions, compiler)

const runServer = async () => {
  console.log('Starting server...')
  await server.start()
}

runServer()

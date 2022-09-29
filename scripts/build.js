'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

import path from 'path';
import fs from 'fs'
import webpack from 'webpack'
import { appDirectory } from '../utils/paths.js'
import webpackConfig from '../webpack.prod.config.js'

const pluginCompiler = webpack(webpackConfig)

pluginCompiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err)
  }
  console.log('Plugin compiled.')
})

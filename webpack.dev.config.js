import { createRequire } from 'module'
import path from 'path';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { scriptDirectory, appDirectory } from './utils/paths.js'
import { kebabToCamelCase } from './utils/createTemplate.js'
const require = createRequire(import.meta.url);
const devPath = path.join(scriptDirectory, 'dev')
const { default: { name, devDependencies } } = await import(path.resolve(appDirectory, 'ds.plugin.config.js'))
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const depPath = path.join(scriptDirectory, 'tmp', 'pluginDeps.js')
let dependencies = 'export default {'

if (devDependencies) {
  const depNames = []
  dependencies = ''

  for (let i = 0; i < devDependencies.length; i++) {
    const dependency = devDependencies[i]
    const name = dependency.split('/')
    const depPath = path.join(appDirectory, 'node_modules', dependency, 'src', 'index.js')
    const depImportName = kebabToCamelCase(name[name.length - 1])
    
    depNames.push(depImportName)

    dependencies += `import ${depImportName} from '${depPath}';\n`
  }

  dependencies += 'export default {'

  for (let i = 0; i < depNames.length; i++) {
    dependencies += depNames[i]
  }
}
console.log(path.resolve(scriptDirectory, '../', 'ds-plugin-action', 'src', 'index.js'))
await fs.writeFileSync(depPath, dependencies +  '}')

export default {
  entry: {
    index: path.join(devPath, './index.js')
  },
  resolve: {
    alias: {
      '@dooksa/plugin': path.join(appDirectory, 'src', 'index.js'),
      '@dooksa/pluginConfig': path.join(appDirectory, 'ds.plugin.config.js'),
      '@dooksa/pluginDeps': depPath
    }
  },
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    compress: true,
    static: {
      directory: devPath
    },
    historyApiFallback: true,
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false
      }
    },
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || '8080'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: name,
      inject: 'body',
      template: path.join(devPath, 'index.html'),
      filename: 'index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        include: path.join(scriptDirectory, 'dev'),
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require.resolve('@babel/preset-env')
            ]
          }
        }
      }
    ]
  }
}

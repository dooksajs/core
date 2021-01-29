const path = require('path')
const resolve = file => path.resolve(__dirname, file)
let { plugin } = require('./src')
plugin = plugin()

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: resolve('dist'),
    library: `${plugin.name}/v${plugin.version}`,
    libraryTarget: 'global',
    libraryExport: 'default',
    globalObject: 'window.pluginLoader'
  },
  resolve: {
    alias: {
      '~': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      }
    ]
  }
}

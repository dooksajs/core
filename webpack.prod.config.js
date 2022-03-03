const path = require('path')
const resolve = file => path.resolve(__dirname, file)
const { filename, name } = require('./ds.plugin.config')

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: `${filename}.js`,
    path: resolve('dist'),
    library: name,
    libraryTarget: 'global',
    libraryExport: 'default',
    globalObject: 'window.dsApp.plugins'
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

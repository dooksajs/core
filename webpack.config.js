const path = require('path')
const resolve = file => path.resolve(__dirname, file)
let { plugin } = require('./src')
plugin = plugin()

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: resolve('dist'),
    library: `${plugin.name}/v${plugin.version}`,
    libraryTarget: 'global',
    libraryExport: 'default',
    globalObject: 'window.pluginLoader'
  },
  devServer: {
    contentBase: resolve('dev'),
    publicPath: '/dev/',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || '8080',
    disableHostCheck: true
  },
  resolve: {
    alias: {
      '@dooksa/ds-plugins': resolve('node_modules/@dooksa/ds-plugins/dist'),
      plugin: resolve('src')
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
            cacheCompression: false,
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      }
    ]
  }
}

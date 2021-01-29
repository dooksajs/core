const path = require('path')
<<<<<<< Updated upstream:webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
=======
const resolve = file => path.resolve(__dirname, file)
let { plugin } = require('./src')
plugin = plugin()
>>>>>>> Stashed changes:webpack.prod.config.js

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
<<<<<<< Updated upstream:webpack.config.js
    path: path.resolve(__dirname, 'dist')
=======
    path: resolve('dist'),
    library: `${plugin.name}/v${plugin.version}`,
    libraryTarget: 'global',
    libraryExport: 'default',
    globalObject: 'window.pluginLoader'
>>>>>>> Stashed changes:webpack.prod.config.js
  },
  mode: 'development',
  devServer: {
    compress: true,
    port: 9000
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
  },
  plugins: [
    new HtmlWebpackPlugin({
      appMountId: 'app',
      filename: 'index.html'
    })
  ]
}

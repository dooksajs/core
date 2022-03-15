
const path = require('path')
const { appDirectory } = require('./utils/paths.js')
const devPath = path.join(appDirectory, 'dev')
const { name, devGlobalObject } = require(path.resolve(appDirectory, 'ds.plugin.config'))
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: path.join(appDirectory, 'dev'),
  entry: './index.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    library: name,
    libraryTarget: 'global',
    libraryExport: 'default',
    globalObject: devGlobalObject || window
  },
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
        include: path.join(appDirectory, 'dev'),
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

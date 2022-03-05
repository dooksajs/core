
const path = require('path')
const { appDirectory } = require('./utils/paths.js')
const devPath = path.join(appDirectory, 'dev')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: path.join(appDirectory, 'dev'),
  entry: './index.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    library: 'dsPlugin'
  },
  devServer: {
    compress: true,
    static: {
      directory: devPath,
      publicPath: devPath
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

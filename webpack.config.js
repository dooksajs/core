const path = require('path')

// Helpers
const resolve = file => path.resolve(__dirname, file)

module.exports = {
  entry: './dev/index.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: resolve('dev'),
    publicPath: '/dev/',
    library: 'DsPlugins'
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
      '@dooksa/ds-plugins': resolve('src')
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

const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { appDirectory } = require(path.join(__dirname, 'utils', 'paths.js'))
const { filename, name, globalObject } = require(path.join(appDirectory, 'ds.plugin.config'))

module.exports = {
  target: 'browserslist:' + path.join(__dirname, '.browserslistrc'),
  entry: path.resolve(appDirectory, 'src/index'),
  mode: 'production',
  output: {
    clean: true,
    filename: `${filename}.js`,
    path: path.resolve(appDirectory, 'dist'),
    publicPath: 'https://cdn.dooksa.com/',
    library: name,
    libraryTarget: 'global',
    libraryExport: 'default',
    globalObject
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        }
      })
    ]
  },
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

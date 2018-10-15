const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

const HOST = 'localhost';
const PORT = 8080;

module.exports = merge(baseConfig, {
  mode: 'development',

  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    contentBase: 'public',
    compress: true,
    host: HOST,
    port: PORT,
    open: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    publicPath: '/',
    quiet: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules/
    },
    historyApiFallback: true,
    noInfo: true,
  },

  output: {
    filename: 'static/[name].js',
    publicPath: '/',
    // Stop hot module replacement plugin from
    // injecting window into pdf.js worker.
    // This made me waste a lot of time while trying to setup pdf.js
    // https://github.com/webpack/webpack/issues/6642#issuecomment-371087342
    globalObject: 'this',
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});

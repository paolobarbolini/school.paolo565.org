const path = require('path');
const merge = require('webpack-merge');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new OptimizeCSSAssetsPlugin(),
      new UglifyWebpackPlugin({
        uglifyOptions: {
          mangle: true,
          ie8: false,
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  output: {
    filename: 'static/[name].[contenthash].min.js',
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin([
      'public',
    ], {
      root: path.join(__dirname, '../'),
    }),
  ],
});

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
          compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true,
            drop_console: true,
          },
          screw_ie8: true,
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

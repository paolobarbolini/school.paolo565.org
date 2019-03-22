const path = require('path');
const merge = require('webpack-merge');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
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
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            ecma: 8,
            unsafe: true,
            warnings: true,
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
    new CleanWebpackPlugin({
      root: path.join(__dirname, '../'),
    }),
  ],
});

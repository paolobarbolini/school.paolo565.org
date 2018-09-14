const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.js'],
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'eslint-loader',
        enforce: 'pre',
      },
      {
        test: /\.css?$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },

  output: {
    path: __dirname + '/../public'
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: 'head',
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, '..', 'src/service-worker.js'),
      filename: 'service-worker.js',
      excludes: [
        'index.html',
      ],
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '..', 'static/icons'),
        to: path.join(__dirname, '..', 'public/static/icons'),
        toType: 'dir',
      },
      {
        from: path.join(__dirname, '..', 'static/favicon.ico'),
        to: path.join(__dirname, '..', 'public/favicon.ico'),
        toType: 'file',
      },
      {
        from: path.join(__dirname, '..', 'static/manifest.json'),
        to: path.join(__dirname, '..', 'public/manifest.json'),
        toType: 'file',
      },
    ]),
    new MiniCssExtractPlugin({
      filename: 'static/[name].[contenthash].min.css',
    }),
  ],
};

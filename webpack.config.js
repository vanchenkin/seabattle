const VueLoaderPlugin = require('vue-loader/lib/plugin');
module.exports = {
  entry: './main.js',
  output:{
    path: __dirname + '/public/',
    filename: 'app.js',
    publicPath: '/public/',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
        'vue-style-loader',
        'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
  },
}
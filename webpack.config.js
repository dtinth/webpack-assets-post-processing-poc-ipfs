const path = require('path')
const RuntimeJsonpScriptSrcPostProcessorPlugin = require('./webpack-hacks/RuntimeJsonpScriptSrcPostProcessorPlugin')

// As you can see, asset hashing is not done at this stage.
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new RuntimeJsonpScriptSrcPostProcessorPlugin(
      'AppRuntime.postProcessAssetPath'
    )
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: require.resolve(
              './webpack-hacks/asset-path-post-processor-loader'
            ),
            options: { postprocessor: 'AppRuntime.postProcessAssetPath' }
          },
          {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        ]
      }
    ]
  }
}

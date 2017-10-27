const path = require('path')

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = path.resolve(__dirname, 'src', 'server', 'index.ls')
    config.output.path = path.resolve(__dirname, 'dist', 'server')
    config.resolve.alias = {
      '~middleware': path.resolve(__dirname, 'src', 'server', 'middleware'),
      '~services': path.resolve(__dirname, 'src', 'services', 'util'),
      '~util': path.resolve(__dirname, 'src', 'server', 'util'),
      '~': path.resolve(__dirname, 'src', 'server')
    }
    config.module.rules.push({
      test: /\.ls$/,
      exclude: /node_modules/,
      loader: 'livescript-loader'
    })
    config.resolve.extensions.push('.ls')
    // console.log(config.resolve.extensions)
    return config
  }
}

const loaderUtils = require('loader-utils')

module.exports = function(content) {
  return content
}

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  const options = loaderUtils.getOptions(this)
  if (!options.postprocessor) {
    throw new Error(
      'asset-path-post-processor-loader: You must specify a post-processor function name.'
    )
  }
  return (
    'module.exports = ' +
    options.postprocessor +
    '(require(' +
    JSON.stringify('-!' + remainingRequest) +
    '));'
  )
}

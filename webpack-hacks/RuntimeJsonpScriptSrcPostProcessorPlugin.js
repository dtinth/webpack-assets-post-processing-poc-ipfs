module.exports = class RuntimeJsonpScriptSrcPostProcessorPlugin {
  constructor(postprocessor) {
    if (!postprocessor) {
      throw new Error(
        'RuntimeJsonpScriptSrcPostProcessorPlugin: You must specify a post-processor function name.'
      )
    }
    this.postprocessor = postprocessor
  }
  apply(compiler) {
    compiler.hooks.afterPlugins.tap(
      'RuntimeJsonpScriptSrcPostProcessorPlugin',
      () => {
        compiler.hooks.thisCompilation.tap(
          'RuntimeJsonpScriptSrcPostProcessorPlugin',
          compilation => {
            if (!compilation.mainTemplate.hooks.jsonpScript) {
              throw new Error(
                'RuntimeJsonpScriptSrcPostProcessorPlugin can only be used when compiling for web (where JsonpMainTemplatePlugin is active)'
              )
            }
            const wrap = hook => {
              hook.tap(
                'RuntimeJsonpScriptSrcPostProcessorPlugin',
                (source, chunk, hash, moduleTemplate, dependencyTemplates) => {
                  return source.replace(
                    /jsonpScriptSrc/g,
                    `(function(chunkId) {
                    return ${this.postprocessor}(jsonpScriptSrc(chunkId))
                  })`
                  )
                }
              )
            }
            wrap(compilation.mainTemplate.hooks.jsonpScript)
            wrap(compilation.mainTemplate.hooks.linkPreload)
            wrap(compilation.mainTemplate.hooks.linkPrefetch)
          }
        )
      }
    )
  }
}

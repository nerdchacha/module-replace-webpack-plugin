module.exports = function createMockCompiler (data, callback) {
  return {
    options: {resolve: {modules: ['node_modules']}},
    plugin: function (event, cb) {
      const nmf = {
        plugin: function (event, cb) {
          cb(data, callback)
        }
      }
      cb(nmf)
    }
  }
}
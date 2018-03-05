const assert = require('assert');
const path = require('path');
const fs = require('fs');

function info(message) {
  console.log(`[INFO] [ModuleReplaceWebpackPlugin] => ${message}`); // eslint-disable-line no-console
}

function fileExistsAsync(path) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'test') { resolve(true); }
    try {
      fs.stat(path, (err, stats) => {
        if (err || !stats.isFile()) { resolve(false); }
        resolve(true);
      });
    } catch (e) {
      reject(false);
    }
  });
}

class ModuleReplaceWebpackPlugin {
  constructor(options = {}) {
    assert(options.modules, 'No modules info provided to ModuleReplaceWebpackPlugin. Please provide a "modules" array to the plugin');
    this.modules = options.modules;
    this.exclude = options.exclude || [];
  }
  apply(compiler) {
    const modulePaths = compiler.options.resolve.modules;
    compiler.plugin('normal-module-factory', (nmf) => {
      nmf.plugin('before-resolve', (data, callback) => {
        if (!data) { return callback(null, data); }
        // Do not run plugin for excluded regex
        const { contextInfo: { issuer = '' } = {}, request = '' } = data;
        if (this.exclude.some(exclude => exclude.test(issuer))) { return callback(null, data); }
        const modulesConfigs = this.modules.filter(module => module.test.test(request));
        // Do not run if the file doesn't match the "test" regex
        if (!modulesConfigs.length) { return callback(null, data); }
        if (modulesConfigs.length > 1) { info('Same module is matched by multiple "test" regex defined in options. Using the first "modules" config that matches.'); }
        const [moduleConfig, ...rest] = modulesConfigs; // eslint-disable-line no-unused-vars
        assert(
          moduleConfig.replace,
          'No file path is provided in the "replace" option to replace the existing module with. \n' +
          'Please provide a file path in modules.',
        );
        const root = process.cwd();
        const resolvablePaths = modulePaths.map(modulePath => path.join(root, modulePath, moduleConfig.replace));
        // Push root directory at the begining so that it gets priority amonst the resolvable paths
        resolvablePaths.unshift(path.join(root, moduleConfig.replace));
        const fileExistsRequests = resolvablePaths.map(fileExistsAsync);
        Promise.all(fileExistsRequests).then((results) => {
          const index = results.indexOf(true);
          if (index > -1) {
            // Replace with the first path that is found that exists
            data.request = resolvablePaths[index];
            info(`Replaced ${request} in ${issuer} with ${resolvablePaths[index]}`);
            return callback(null, data);
          }
        });
      });
    });
  }
}

module.exports = ModuleReplaceWebpackPlugin;

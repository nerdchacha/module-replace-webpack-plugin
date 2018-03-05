'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require('assert');
var path = require('path');
var fs = require('fs');

function info(message) {
  console.log('[INFO] [ModuleReplaceWebpackPlugin] => ' + message); // eslint-disable-line no-console
}

function fileExistsAsync(path) {
  return new Promise(function (resolve, reject) {
    if (process.env.NODE_ENV === 'test') {
      resolve(true);
    }
    try {
      fs.stat(path, function (err, stats) {
        if (err || !stats.isFile()) {
          resolve(false);
        }
        resolve(true);
      });
    } catch (e) {
      reject(false);
    }
  });
}

var ModuleReplaceWebpackPlugin = function () {
  function ModuleReplaceWebpackPlugin() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ModuleReplaceWebpackPlugin);

    assert(options.modules, 'No modules info provided to ModuleReplaceWebpackPlugin. Please provide a "modules" array to the plugin');
    this.modules = options.modules;
    this.exclude = options.exclude || [];
  }

  _createClass(ModuleReplaceWebpackPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      var modulePaths = compiler.options.resolve.modules;
      compiler.plugin('normal-module-factory', function (nmf) {
        nmf.plugin('before-resolve', function (data, callback) {
          if (!data) {
            return callback(null, data);
          }
          // Do not run plugin for excluded regex
          var _data$contextInfo = data.contextInfo;
          _data$contextInfo = _data$contextInfo === undefined ? {} : _data$contextInfo;
          var _data$contextInfo$iss = _data$contextInfo.issuer,
              issuer = _data$contextInfo$iss === undefined ? '' : _data$contextInfo$iss,
              _data$request = data.request,
              request = _data$request === undefined ? '' : _data$request;

          if (_this.exclude.some(function (exclude) {
            return exclude.test(issuer);
          })) {
            return callback(null, data);
          }
          var modulesConfigs = _this.modules.filter(function (module) {
            return module.test.test(request);
          });
          // Do not run if the file doesn't match the "test" regex
          if (!modulesConfigs.length) {
            return callback(null, data);
          }
          if (modulesConfigs.length > 1) {
            info('Same module is matched by multiple "test" regex defined in options. Using the first "modules" config that matches.');
          }

          var _modulesConfigs = _toArray(modulesConfigs),
              moduleConfig = _modulesConfigs[0],
              rest = _modulesConfigs.slice(1); // eslint-disable-line no-unused-vars


          assert(moduleConfig.replace, 'No file path is provided in the "replace" option to replace the existing module with. \n' + 'Please provide a file path in modules.');
          var root = process.cwd();
          var resolvablePaths = modulePaths.map(function (modulePath) {
            return path.join(root, modulePath, moduleConfig.replace);
          });
          // Push root directory at the begining so that it gets priority amonst the resolvable paths
          resolvablePaths.unshift(path.join(root, moduleConfig.replace));
          var fileExistsRequests = resolvablePaths.map(fileExistsAsync);
          Promise.all(fileExistsRequests).then(function (results) {
            var index = results.indexOf(true);
            if (index > -1) {
              // Replace with the first path that is found that exists
              data.request = resolvablePaths[index];
              info('Replaced ' + request + ' in ' + issuer + ' with ' + resolvablePaths[index]);
              return callback(null, data);
            }
          });
        });
      });
    }
  }]);

  return ModuleReplaceWebpackPlugin;
}();

module.exports = ModuleReplaceWebpackPlugin;
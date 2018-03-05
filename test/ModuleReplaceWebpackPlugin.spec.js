const expect = require('chai').expect;
const assert = require('assert');
const ModuleReplaceWebpackPlugin = require('../src');
const createMockCompiler = require('./mockCompiler');

describe ('ModuleReplaceWebpackPlugin options', function () {
  it ('Should assert if modules option is not provided', function () {
    try {
      this.plugin = new ModuleReplaceWebpackPlugin();
    } catch (e) {
      expect(e.message).to.contain('No modules info provided to ModuleReplaceWebpackPlugin. Please provide a "modules" array to the plugin')
    }
  })
  
  it ('Should assert if replace option is not provided', function () {
    try {
      this.plugin = new ModuleReplaceWebpackPlugin({
        modules: [{
          test: /darth-vader.js/
        }]
      });
    } catch (e) {
      expect(e.message).to.contain('No file path is provided in the "replace" option to replace the existing module with')
    }
  })
  
  it ('Should should replace module for desired paths', function (done) {
    const plugin = new ModuleReplaceWebpackPlugin({
      modules: [{
        test: /lodash/,
        replace: './patchedLodash.js'
      }],
      exclude: [/patchedLodash.js$/],
    });
    const data = { contextInfo: { issuer: './index.js' }, request: 'lodash' };
    function cb (error, data) {
      expect(data.request).to.contain('patchedLodash.js');
      done();
    }
    const compiler = createMockCompiler(data, cb);
    plugin.apply(compiler);
  })
  
  it ('Should not run for excluded paths', function (done) {
    const plugin = new ModuleReplaceWebpackPlugin({
      modules: [{
        test: /lodash/,
        replace: './patchedLodash.js'
      }],
      exclude: [/patchedLodash.js$/],
    });
    const data = { contextInfo: { issuer: './patchedLodash.js' }, request: 'lodash' };
    function cb (error, data) {
      expect(data.request).to.equal('lodash');
      done();
    }
    const compiler = createMockCompiler(data, cb);
    plugin.apply(compiler);
  })
  
  it ('Should take multiple excluded paths', function (done) {
    const plugin = new ModuleReplaceWebpackPlugin({
      modules: [{
        test: /lodash/,
        replace: './patchedLodash.js'
      }],
      exclude: [/patchedLodash.js$/, /anotherExclude.js/],
    });
    const data = { contextInfo: { issuer: './anotherExclude.js' }, request: 'lodash' };
    function cb (error, data) {
      expect(data.request).to.equal('lodash');
      done();
    }
    const compiler = createMockCompiler(data, cb);
    plugin.apply(compiler);
  })
}) 
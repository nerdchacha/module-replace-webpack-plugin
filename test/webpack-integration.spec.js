const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const expect = require('chai').expect;
const ModuleReplaceWebpackPlugin = require('../src');

describe ('Webpack integration', function () {
  it('Should replace mdoule with module defined in config', function (done) {
    const options = {
      entry: path.join(__dirname, './case/index.js'),
      output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './case/dist'),
      },
      plugins: [
        new ModuleReplaceWebpackPlugin({
          modules: [{
            test: /lodash\/map/,
            replace: './test/case/patchedMap.js',
          }],
        }),
      ],
    }
    webpack(options, function (err, stats) {
      if (err) console.log(err);
      fs.readFile(path.join(__dirname, './case/dist/bundle.js'), (err, data) => {
        if (err) console.log(err);
        expect(data.toString()).to.contain('This function has been patched');
        done();
      });
    })
  })
})
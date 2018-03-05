# Module Replace Webpack Plugin
A webpack plugin to replace or patch any imported file/module before build.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![License: MIT](https://travis-ci.org/nerdchacha/module-replace-webpack-plugin.svg?branch=master)

There are times when you would want to monkey patch a third party library for instance `lodash`. 
Creating a forked version or putting in a PR are both sometimes either to cumbersome or not practically possible.
Another possible way is to patch it and ask all devs to start referencing to `lodash` as 

`const lodash = require('./patchedLodash')`
OR
`import lodash from './patchedLodash'`

Although this can get the job done, a more elegant way could be to let the devs import lodash the usual way, but include a plugin in the webpack build process to replace all lodash imports with your patched version.

So in other words, webpack will change all occurrences of 

`const lodash = require('lodash')` 
to
`const lodash = require('./patchedLodash')`

OR
`import lodash from 'lodash'`
to
`import lodash from './patchedLodash'`

when  building your application.


## Installation
```
npm i module-replace-webpack-plugin --save-dev
```

## Usage
```js
const ModuleReplaceWebpackPlugin = require('module-replace-webpack-plugin');

// webpack config
{
  plugins: [
    new ModuleReplaceWebpackPlugin({options})
  ]
}
```

## Example Webpack Config
```js
const ModuleReplaceWebpackPlugin = require('module-replace-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new ModuleReplaceWebpackPlugin({
      modules: [{
        test: /lodash/,
        require: './src/patchedLodash.js'
      }],
      exclude: [/patchedLodash.js$/]
    })
  ]
}

```

## Options
### modules (Array of objects) (required)
Contains config that will be used to replace import statements during build process.

example 
```js
module: [{
  test: /lodash/,
  require: './src/patchedLodash.js'
}],
```

**NOTE**: 
- This options is an array and is a **required** option.

### test (regex)
Regex that will be used to test the import statements.

for example 
`test: /lodash/,`
will match `import { map } from 'lodash'`
and `import lodash from 'lodash'`

**NOTE**:
- If multiple objects are provided that match the same module, the config for the first one that matches will be used.

### replace (string)
Contains the path to the file that will be used to replace the module with.

example `require: './src/patchedLodash.js'`

**NOTE**: 
- This path should be provided from the root directory.
- file extension is mandatory
- if `resolve` options is provided in the webpack config, this will first find the file in root and then try to find the file in paths defined under `resolve`.


### exclude (Array of regex)
If the file that is being build has an import statement that matches the `test` regex, that file can be forced to not replace that import statement by including its path in the exclude setting.

In other words, mention regex for files for which you dont want this plugin to run.

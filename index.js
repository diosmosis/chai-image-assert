'use strict';

const path = require('path');
const fs = require('fs');

if (isDirectory(path.join(__dirname, 'dist'))) {
  module.exports = require('./dist');
} else {
  require('babel-register');
  module.exports = require('./lib');
}

function isDirectory(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}

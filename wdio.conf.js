require('babel-polyfill');
require('babel-register');

exports.config = {
  host: 'hub',
  port: 4444,
  path: '/wd/hub',

  specs: [
    './test/system/*.spec.js',
  ],
  capabilities: [
    {
      'browserName': 'chrome'
    },
  ],

  logLevel: 'silent',
  coloredLogs: true,
  baseUrl: 'http://viewer:3000',
  waitforTimeout: 200000,
  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
    reporter: 'spec',
  },

  plugins: {
    'wdio-screenshot': {},
  },
};

/* global atom */
'use babel'
'use strict'

const WeexRuner = require('./lib/weex-run')

module.exports = {

  // start server dumplings
  activate () {
    this.runner = new WeexRuner()
  },

  deactivate () {

  }
}

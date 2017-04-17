/* global atom */
'use babel'
'use strict'

const WeexRuner = require('./lib/weex-run')

const DevicePanel = require('./lib/thera-device-panel')


module.exports = {

  // start server dumplings
  activate () {
    this.runner = new WeexRuner()
    this.devicePanel = new DevicePanel();
    this.devicePanel.activate();
  },

  deactivate () {
    this.devicePanel.deativate();
  }
}

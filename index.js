/* global atom */
'use babel'
'use strict'


const DevicePanel = require('./lib/thera-device-panel')


module.exports = {

  // start server dumplings
  activate () {
    this.devicePanel = new DevicePanel();
    this.devicePanel.activate();
  },

  deactivate () {
    this.devicePanel.deativate();
  }
}

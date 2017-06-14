/* global atom */
'use babel'
'use strict'

const DevicePanel = require('./lib/thera-device-panel')
const configurationManager = require('./lib/configurationManager')

module.exports = {

  // start server dumplings
  activate () {
    this.devicePanel = new DevicePanel()
    this.devicePanel.activate()
  },

  deactivate () {
    this.devicePanel.deactivate()
  },

  // provide thera project configuration, returns a promise object.
  provideProjectConfig () {
    return configurationManager
  },

  cosumeProjectConfig (configurationManager) {
    configurationManager.getConfig().then((c) => console.log(c))
  }
}

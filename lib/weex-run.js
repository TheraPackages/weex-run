'use babel'
'use strict'

const SimulatorManager = require('./simulatorManager')
const PreviewClient = require('./previewClient')
const PreviewServer = require('./previewServer')
const QRCodeView = require('./qrcodeView')
const notifier = require('./notifier')
const execSync = require('child_process').execSync
const $ = require('jquery')
const path = require('path')
const touch = require('touch')
const configurationManager = require('./configurationManager')

const commandStart = 'thera-live-server:start'
const commandStop = 'thera-live-server:stop'
const commandDebug = 'thera-live-server:debug'
const commandQRCode = 'thera-live-server:qrcode'
const commandTransformed = 'thera-live-server:transformed'

module.exports = class WeexRuner {

  constructor () {
    this.simulatorManager = new SimulatorManager()
    this.previewClient = new PreviewClient()
    this.previewServer = new PreviewServer()

    this._activate()
  }

  _activate () {
    let _this = this
    this.simulatorManager.devicesList().then((sims) => {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'tool-bar:flash-devicelist', sims)
      _this.simulatorManager.load()
    })

    // init events callback
    atom.commands.add(atom.commands.rootNode, commandStart, () => _this.start())
    atom.commands.add(atom.commands.rootNode, commandStop, () => _this.stop())
    atom.commands.add(atom.commands.rootNode, commandDebug, () => _this.debug())
    atom.commands.add(atom.commands.rootNode, commandQRCode, () => _this.qrcode())
    atom.commands.add(atom.commands.rootNode, commandTransformed, (notify) => _this._transformed(notify))

    // disabled stop button on startup
    this._changeRuningState(false)

    this.previewServer.on('start', () => {
      _this._changeRuningState(true)
    })

    this.previewServer.on('close', () => {
      _this._changeRuningState(false)
    })
  }

  start () {
    notifier.addInfo('Starting')
    const _this = this
    configurationManager.getConfig()
      .then((config) => {
        if (config.type === 'weex') {
          // generate unused port
          const scriptPath = path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'FindUnusePort.sh')
          const port = execSync(`sh + ${scriptPath} + 2> /dev/null`, {encoding: 'utf8'})
          atom.config.set('weex-run.dumplingPort', port.trim())

          Promise.all([_this.simulatorManager.start(), _this.previewServer.boot()])
            .then(() => _this.previewClient.wsConnect())
            // start to preview file
            .then(() => _this._startPreviewFile())
            .then((watchFilePath) => _this.previewClient.start(watchFilePath))
            .then(() => _this._saveWatchingFile())
            .catch(err => notifier.addError(err.message))
        } else {
          _this.simulatorManager.start()
          atom.commands.dispatch(atom.views.getView(atom.workspace), commandDebug)
          _this._changeRuningState(true)
        }
      })
  }

  _startPreviewFile () {
    return configurationManager.getWatchFilePath()
  }

  _saveWatchingFile () {
    return new Promise((resolve, reject) => {
      // save the editor
      if (this.watchFilePath) {
        touch(this.watchFilePath)
      }
      resolve()
    })
  }

  stop () {
    this.simulatorManager.stop()
    notifier.addSuccess('Stoped')

    // stop server
    const _this = this
    configurationManager.getConfig()
      .then((config) => {
        if (config.type === 'weex') {
          _this.previewServer.stop()
        } else {
          _this._changeRuningState(false)
        }
      })
    console.log('running stoped')
  }

  debug () {
  }

  qrcode () {
    this.qrcodePanel = this.qrcodePanel || new QRCodeView()
    this.qrcodePanel.show()

    if (!this.previewServer.getDumplingProcess()) {
      // generate unused port
      const scriptPath = path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'FindUnusePort.sh')
      const port = execSync(`sh + ${scriptPath} + 2> /dev/null`, {encoding: 'utf8'})
      atom.config.set('weex-run.dumplingPort', port.trim())

      this.previewServer.boot()
        .then(() => this.previewClient.requestQRCode())
        .then((qrcodeContent) => this.qrcodePanel.generateQRCode(qrcodeContent))
        .catch((err) => console.error(err))
        .then((qrcodePath) => this.qrcodePanel.displayQRCode(qrcodePath))
        .then(() => this.previewClient.wsConnect())
        // start to preview file
        .then(() => this._startPreviewFile())
        .then(() => this.previewClient.start(this.watchFilePath))
        .then(() => this._saveWatchingFile())
        .catch(err => notifier.addError(err.message))
    } else {
      this.previewClient.requestQRCode()
        .then((qrcodeContent) => this.qrcodePanel.generateQRCode(qrcodeContent))
        .catch((err) => console.error(err))
        .then((qrcodePath) => this.qrcodePanel.displayQRCode(qrcodePath))
        .then(() => this.previewClient.wsConnect())
        // start to preview file
        .then(() => this._startPreviewFile())
        .then(() => this.previewClient.start(this.watchFilePath))
        .then(() => this._saveWatchingFile())
        .catch(err => notifier.addError(err.message))
    }
  }

  _changeRuningState (running) {
    if (running) {
      // $('.mdi-play').attr('disabled', 'disabled')
      $('.mdi-stop').removeAttr('disabled')
      $('#oreo-server-status').text('Oreo-Server is running')
      $('#oreo-server-status').css('color', 'rgb(60,184,121)')
      $('.fa-heartbeat').css('color', 'rgb(60,184,121)')
    } else {
      // $('.mdi-play').removeAttr('disabled')
      $('.mdi-stop').attr('disabled', 'disabled')
      $('#oreo-server-status').text('Oreo-Server is shut down')
      $('#oreo-server-status').css('color', 'red')
      $('.fa-heartbeat').css('color', 'red')
    }
  }

  _transformed (notify) {
    configurationManager.getConfig()
      .then(({notifyOnSync}) => {
        if (notifyOnSync) {
          let {message, data} = notify.detail
          if (message === 'transformSuccessNotify') {
            notifier.addSuccess('sync success')
          } else if (message === 'transformFailedNotify') {
            notifier.addError(`sync faled, ${JSON.stringify(data.error)}`)
          }
        }
      })
  }
}

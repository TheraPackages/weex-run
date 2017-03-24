'use babel'
'use strict'

const SimulatorManager = require('./simulatorManager')
const PreviewClient = require('./previewClient')
const PreviewServer = require('./previewServer')
const QRCodeView = require('./qrcodeView')
const notifier = require('./notifier')
const childProcess = require('child_process')
const execSync = require('child_process').execSync
const $ = require('jquery')
const path = require('path')
const touch = require('touch')
const configurationManager = require('./configurationManager')

const commandStart = 'thera-live-server:start'
const commandStop = 'thera-live-server:stop'
const commandDebug = 'thera-live-server:debug'
const commandQRCode = 'thera-live-server:qrcode'

// const WEEX_EXTENSION = ['we', 'weex']
const DEFAULT_PORT = 7001

module.exports = class WeexRuner {

  activate () {
    let port = atom.config.get('weex-run.dumplingPort') || DEFAULT_PORT
    atom.config.set('weex-run.dumplingPort', port)

    let _this = this
    this.simulatorManager = this.simulatorManager || new SimulatorManager()
    this.simulatorManager.devicesList().then((sims) => {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'tool-bar:flash-devicelist', sims)
      _this.simulatorManager.load()
    })

    // init events callback
    atom.commands.add(atom.commands.rootNode, commandStart, () => _this.start())
    atom.commands.add(atom.commands.rootNode, commandStop, () => _this.stop())
    atom.commands.add(atom.commands.rootNode, commandDebug, () => _this.debug())
    atom.commands.add(atom.commands.rootNode, commandQRCode, () => _this.qrcode())

    // disabled stop button on startup
    this._changeRuningState(false)

    this.previewServer = this.previewServer || new PreviewServer()
    this.previewServer.on('start', () => {
      _this._changeRuningState(true)
    })

    this.previewServer.on('close', () => {
      _this._changeRuningState(false)
    })
  }

  start () {
    const scriptPath = path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'FindUnusePort.sh')
    const port = execSync(`sh + ${scriptPath} + 2> /dev/null`, {encoding: 'utf8'})
    atom.config.set('weex-run.dumplingPort', port.trim())
    this.simulatorManager = this.simulatorManager || new SimulatorManager()
    this.previewClient = this.previewClient || new PreviewClient()
    notifier.addInfo('Starting')

    // start simulator
    let promiseSimulator = this.simulatorManager.start()
    let promiseServer = (this.previewServer || new PreviewServer()).boot()
    // TODO: @778477
    // launch Preview, terminate Preview, slow down relaunch
    Promise.all([promiseSimulator, promiseServer])
      .then(() => this.previewClient.wsConnect())
      // start to preview file
      .then(() => this._startPreviewFile())
      .then((watchFilePath) => this.previewClient.start(watchFilePath))
      .then(() => this._saveWatchingFile())
      .catch(err => notifier.addError(err.message))
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
    // stop all simulators
    // this._changeRuningState(false)

    // childProcess.exec('killall -c Simulator')
    this.simulatorManager.stop()
    notifier.addSuccess('Stoped')

    // stop server
    this.previewServer = this.previewServer || new PreviewServer()
    this.previewServer.stop(() => {
      console.log('running stoped')
    })
  }

  debug () {
  }

  qrcode () {
    this.qrcodePanel = this.qrcodePanel || new QRCodeView()
    this.previewServer = this.previewServer || new PreviewServer()
    this.previewClient = this.previewClient || new PreviewClient()

    this.qrcodePanel.show()

    if (!this.previewServer.getDumplingProcess()) {
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

  getPreviewClient () {
    this.previewClient = this.previewClient || new PreviewClient()
    return this.previewClient
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
}

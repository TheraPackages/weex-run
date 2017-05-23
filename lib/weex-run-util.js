'use babel'
'use strict'

const SimulatorManager = require('./simulatorManagerUtil')
const PreviewClient = require('./previewClient')
const PreviewServer = require('./previewServer')
const QRCodeViewUtil = require('./qrcodeViewUtil')
const notifier = require('./notifier')
const execSync = require('child_process').execSync
const $ = require('jquery')
const path = require('path')
const touch = require('touch')
const configurationManager = require('./configurationManager')

const commandTransformed = 'thera-live-server:transformed'


module.exports = class WeexRunUtil {

  constructor () {
    this.simulatorManagerUtil = new SimulatorManager()
    this.previewClient = new PreviewClient()
    this.previewServer = new PreviewServer()

    this._activate()
  }

  _activate () {
    let _this = this
    this.simulatorManagerUtil.devicesList().then((sims) => {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'tool-bar:flash-devicelist', sims)
      _this.simulatorManagerUtil.load()
    })


    // init events callback
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

  qrcode () {
    this.qrcodeViewUtil = this.qrcodeViewUtil || new QRCodeViewUtil()

    if (!this.previewServer.getDumplingProcess()) {
      // generate unused port
      const scriptPath = path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'FindUnusePort.sh')
      const port = execSync(`sh + ${scriptPath} + 2> /dev/null`, {encoding: 'utf8'})
      atom.config.set('weex-run.dumplingPort', port.trim())

      this.previewServer.boot()
        .then(() => this.previewClient.requestQRCode())
        .then((qrcodeContent) => this.qrcodeViewUtil.generateQRCode(qrcodeContent))
        .catch((err) => console.error(err))
        .then((qrcodePath) => this.qrcodeViewUtil.generateQRImg())
        .then(() => this.previewClient.wsConnect())
        // start to preview file
        .then(() => this._startPreviewFile())
        .then(() => this.previewClient.start(this.watchFilePath))
        .then(() => this._saveWatchingFile())
        .catch(err => console.error(err.message))
    } else {
      this.previewClient.requestQRCode()
        .then((qrcodeContent) => this.qrcodeViewUtil.generateQRCode(qrcodeContent))
        .catch((err) => console.error(err))
        .then((qrcodePath) => this.qrcodeViewUtil.generateQRImg())
        .then(() => this.previewClient.wsConnect())
        // start to preview file
        .then(() => this._startPreviewFile())
        .then(() => this.previewClient.start(this.watchFilePath))
        .then(() => this._saveWatchingFile())
        .catch(err => notifier.addError(err.message))
    }
    return this.qrcodeViewUtil.qrImageWithGuide
  }

  _changeRuningState (running) {
    console.log("Change running state: " + running)
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

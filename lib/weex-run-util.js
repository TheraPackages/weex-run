'use babel'
'use strict'

const SimulatorManager = require('./simulatorManagerUtil')
const PreviewClient = require('./previewClient')
const PreviewServer = require('./previewServer')
const QRCodeViewUtil = require('./qrcodeViewUtil')
const notifier = require('./notifier')
const path = require('path')
const touch = require('touch')
const configurationManager = require('./configurationManager')
const fs = require('fs')
const chokidar = require('chokidar')
const findPort = require('find-free-port')

const commandTransformed = 'thera-live-server:transformed'
const findChangedCommand = 'thera-project-service:file-changed'

module.exports = class WeexRunUtil {

  constructor () {
    this.simulatorManagerUtil = new SimulatorManager()
    this.previewClient = new PreviewClient()
    this.previewServer = new PreviewServer()

    this._activate()
  }

  deactivate () {
    this.previewServer.deactivate()
  }

  _activate () {
    let _this = this
    this.simulatorManagerUtil.devicesList().then((sims) => {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'tool-bar:flash-devicelist', sims)
      _this.simulatorManagerUtil.load()
    })

    // init events callback
    atom.commands.add(atom.commands.rootNode, commandTransformed, (notify) => _this._transformed(notify))
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
      findPort(7000, (err, port) => {

        atom.config.set('weex-run.dumplingPort', ' ' + port)

        this.previewServer.boot()
          .then(() => this.previewClient.requestQRCode())
          .then((qrcodeContent) => this.qrcodeViewUtil.displayQRCode(qrcodeContent))
          .catch((err) => console.error(err))
          .then(() => this.previewClient.wsConnect())
          .then(() => this._watchConfigFile())
          // start to preview file
          .then(() => this._startPreviewFile())
          .then(() => this.previewClient.start(this.watchFilePath))
          .then(() => this._saveWatchingFile())
          .catch(err => console.error(err.message))
      })

    } else {
      this.previewClient.requestQRCode()
        .then((qrcodeContent) => this.qrcodeViewUtil.displayQRCode(qrcodeContent))
        .catch((err) => console.error(err))
        .then(() => this.previewClient.wsConnect())
        // start to preview file
        .then(() => this._startPreviewFile())
        .then(() => this.previewClient.start(this.watchFilePath))
        .then(() => this._saveWatchingFile())
        .catch(err => console.error(err.message))
    }
    return this.qrcodeViewUtil.qrImageWithGuide
  }

  _watchConfigFile () {
    if (!this.watchingConfig) {
      const _this = this

      if (atom.project.getDirectories()[0]) {
        this._onProjectDirChange(atom.project.getDirectories()[0].path)
      }

      atom.project.onDidChangePaths((projectPaths) => {
        if (projectPaths[0] && this.watchProjectPath !== projectPaths[0]) {
          _this._onProjectDirChange(projectPaths[0])
        }
      })
    }
  }

  _onProjectDirChange (projectPath) {
    this.watchProjectPath = projectPath
    const _this = this

    chokidar.watch(path.join(projectPath), {ignored: path.join(projectPath, 'node_modules')}).on('all', (event, filePath) => {
      // dispatch all file change events
      atom.commands.dispatch(atom.views.getView(atom.workspace), findChangedCommand, {event: event, filePath: filePath})

      // consumes launch config message
      if (filePath.endsWith(path.join('.thera', 'launch.json')) && event !== 'unlink') {
        _this._previewConfigChange()
      }
    })
  }

  _previewConfigChange () {
    this._startPreviewFile()
      .then(() => this.previewClient.start(this.watchFilePath))
  }


  updateQrCode () {
    this.previewClient.requestQRCode()
        .then((qrcodeContent) => this.qrcodeViewUtil.displayQRCode(qrcodeContent))
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

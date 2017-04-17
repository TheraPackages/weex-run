'use babel'

import { CompositeDisposable } from 'atom'

var WsBridge = function (sendCallback) {
  this.sendCallback = sendCallback
  this.dispatcher = new WsBridge.Dispatcher()
  this.collector = new WsBridge.Collector(this)
}

WsBridge.prototype = {

  dispose: function () {
    this.sendCallback = null
    this.dispatcher.dispose()
    this.collector.dispose()
  },

  /**
   * @param {Object} payload
   */
  dispatch: function (payload) {
    this.dispatcher.dispatch(payload)
  },

  /**
   * @param {string} payload
   */
  transmit: function (payload) {
    if (this.sendCallback) {
      this.sendCallback(payload)
    }
  }
}

WsBridge.Dispatcher = function () {

}

WsBridge.Dispatcher.prototype = {

  dispose: function () {
    // Need do nothing.
  },
  /**
   * Dispatch websocket payload from server to atom packages.
   */
  dispatch: function (payload) {
    if (!payload) {
      return
    }
    if (payload.type === 'utf8') {
      this._dispatchUtf8(payload.utf8Data)
    } else if (payload.type === 'binary') {
      this._dispatchBinary(payload.binaryData)
    }
  },

  _dispatchUtf8 (strData) {
    var dataObj = JSON.parse(strData)
    if (dataObj.message === 'inspector') {
      // inspector message
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'thera-debugger:inspector:recv', dataObj.data)
    } else if (dataObj.message === 'reload') {
      // reload inspector or debugger
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'thera-debugger:reload', dataObj.data)
    } else if (dataObj.message === 'preview-server') {
      // message produced by preview server
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'thera-preview:server', dataObj.data)
    } else if (dataObj.message === 'transformSuccessNotify' || dataObj.message === 'transformFailedNotify') {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'thera-live-server:transformed', dataObj)
    } else {
      // server transform log
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'linter:weex-transform-msg', strData)
    }
  },

  _dispatchBinary (binData) {
    // Ignored
  }
}

/**
 * @constructor
 * Collect messages from atom and transmit them via bridge
 */
WsBridge.Collector = function (bridge) {
  this._bridge = bridge
  this._subscriptions = new CompositeDisposable()
  this._subscriptions.add(atom.commands.add('atom-workspace', {
    // Send inspector command to mobile apps.
    'thera-debugger:inspector:command': (event) => this.inspectorSend(event.detail),
    // Tell new connected devices the debugger server location.
    'thera-debugger:debugger:connection': (event) => this.debuggerSend(event.detail)
  }))
}

WsBridge.Collector.prototype = {
  dispose: function () {
    this._subscriptions.dispose()
  },

  inspectorSend: function (payload) {
    var message = {
      message: 'inspector',
      v: '1.0',
      data: {
        inspectCmd: payload
      }
    }
    this.transmit(message)
  },

  debuggerSend: function (payload) {
    var message = {
      message: 'debugger',
      v: '1.0',
      data: {
        debugger: payload
      }
    }
    this.transmit(message)
  },

  transmit: function (message) {
    if (!(typeof message === 'string')) {
      message = JSON.stringify(message)
    }
    this._bridge.transmit(message)
  }
}

module.exports = WsBridge

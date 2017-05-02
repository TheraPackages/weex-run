'use babel'
'use strict'

const request = require('request')

const WebSocketClient = require('websocket').client
const WsBridge = require('./wsBridge')
const configurationManager = require('./configurationManager')

const previewRequest = 'http://127.0.0.1:PORT/theraConfig'
const wsAddress = 'http://127.0.0.1:PORT'
const pageQRCode = 'http://127.0.0.1:PORT/ipAddressPort'

const WS_SEND_MSG = 'weex-run:ws-send-msg'
const HTTP_SEND_MSG = 'weex-run:http-send-msg'
const WS_CONNECTED = 'weex-run:ws-connected'

const SERVER_STATUS_STARTING = "starting"
const SERVER_STATUS_RUNNING = "running"
const SERVER_STATUS_SHUTDOWN = "shutdown"

module.exports = class PreviewClient {
  constructor () {
    atom.commands.add(atom.commands.rootNode, WS_SEND_MSG, (content) => this.wsSend(content))
    atom.commands.add(atom.commands.rootNode, HTTP_SEND_MSG, (content) => this.httpSend(content))
  }

  start (fileToRun, protocol) {
    return new Promise((resolve, reject) => {
      // let curEditor = atom.workspace.getActiveTextEditor()
      // let filePath = fileToRun || curEditor.getPath()

      configurationManager.getConfig()
        .then((configObject) => {
          let options = {
            url: previewRequest.replace('PORT', atom.config.get('weex-run.dumplingPort')),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'message': 'theraConfig',
              'data': configObject
            })
          }

          request(options, (err, response, body) => {
            if (err) reject(err)
            else {
              console.log('start monitor file...')
              console.log(body)
              resolve()
            }
          })
        })
    })
  }

  requestQRCode () {
    return new Promise((resolve, reject) => {
      const imgURL = pageQRCode.replace('PORT', atom.config.get('weex-run.dumplingPort'))
      request(imgURL, (err, response, body) => {
        if (err || response.statusCode !== 200) {
          console.error(`request qr image ${imgURL} error`, err)
          resolve(undefined)
        } else {
          resolve(body)
        }
      })
    })
  }

  httpSend (content) {
    let {url, method, headers, body} = content.detail
    let payload = {
      url: url,
      method: method,
      headers: headers,
      body: JSON.stringify(body)
    }

    console.log(`send request ${url}`)
    if (payload.method === 'POST') console.log(`send request body ${JSON.stringify(body)}`)
    request(payload, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        if (err) console.error(err)
        else console.error(err)
      } else {
        console.log(body)
      }
    })
  }

  wsSend (content) {
    this.wsClient = this.wsClient || new WebSocketClient()
    if (this.wsClient.connection) {
      console.log(`ws send msg ${JSON.stringify(content.detail)}`)
      this.wsClient.connection.sendUTF(JSON.stringify(content.detail))
    } else {
      console.error('not connected yet')
    }
  }

  wsConnect () {
    var self = this
    return new Promise((resolve, reject) => {
      // If connection is valid, needn't do any thing.
      if (this.wsClient && this.wsClient.connection && this.wsClient.connection.state === 'open') {
        console.log('Thera connection to dumpling is alive. Needn\'t reconnection.');
        resolve();
        return;
      }
      // Clear current connection state.
      if (this.wsClient && this.wsClient.connection) {
        this.wsClient.connection.close('Normally closed.')
        this.wsClient = null
      }
      this.wsClient = this.wsClient || new WebSocketClient()
      this.wsClient.on('connectFailed', (error) => {
        reject(error)
        console.log(`Connect error: ${error.toString()}`)
      })
      this.wsClient.on('connect', (connection) => {
        console.log('websocket connected')
        self.wsClient.connection = connection

        connection.on('error', (error) => {
          console.log(`Connection error: ${error.toString()}`)

          // reconnect after delay
          setTimeout(() => {
            console.log('reconnecting websocket after 3 seconds')

            self.wsClient.connect(
              wsAddress.replace('PORT', atom.config.get('weex-run.dumplingPort')),
              undefined,
              undefined,
              {'from': 'thera'}
            )
          }, 1000 * 3)
        })

        connection.on('close', (error) => {
          console.log('Connection closed: ' + error.toString())
          notifyServerStatus.apply(self, [SERVER_STATUS_SHUTDOWN])
        })

        // dispatch message
        connection.on('message', onRecvCallback.bind(self))
        atom.commands.dispatch(atom.views.getView(atom.workspace), WS_CONNECTED)
        resolve()
      })

      function onRecvCallback (message) {
        // console.log(message)
        this.wsBridge.dispatch(message)
      }

      function onSendCallback (message) {
        // console.log(message)
        this.wsClient.connection.sendUTF(message)
      }

      function notifyServerStatus(status) {
        console.log('Server status: ' + status)
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'thera-live-server:shutdown')
      }

      if (this.wsBridge) {
        this.wsBridge.dispose()
        this.wsBridge = null
      }
      this.wsBridge = new WsBridge(onSendCallback.bind(this))

      // connect with header from:thera
      this.wsClient.connect(
        wsAddress.replace('PORT', atom.config.get('weex-run.dumplingPort')),
        undefined,
        undefined,
        {'from': 'thera'}
      )
    })
  }
}

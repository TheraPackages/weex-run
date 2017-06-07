'use strict'
'use babel'

const fsp = require('fs-promise')
const path = require('path')
const fs = require('fs')

const HTTP_SEND_MSG = 'weex-run:http-send-msg'
const MOCK_DATA_URL = 'http://localhost:PORT/mockConfig'

module.exports = (function () {
  var mockConfigPath

  function init() {
    let projectPath = atom.project.getDirectories()[0].path
    mockConfigPath = path.join(projectPath, 'mock', 'config.json')

    // send config on connected
    fsp.readJson(mockConfigPath)
      .then((mockJSON) => {
        let msg = _parseMockConfig(mockJSON)
        _sendConfig(msg)
      })

    // watch config changes
    fs.watchFile(mockConfigPath, (curr, prev) => {
      fsp.readJson(mockConfigPath)
        .then((mockJSON) => {
          let payload = _parseMockConfig(mockJSON)
          _sendConfig(payload)
        })
    })
  }
  

  function _parseMockConfig (config) {
    let projectPath = atom.project.getDirectories()[0].path
    var body
    if (config) {
      body = {
        'message': 'mock',
        'data': {
          'mockData': [],
          'mockModules': []
        }
      }
      if(config.hasOwnProperty('mockData')){
        config.mockData.forEach((data) => {
          let mockUnit = {}
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              mockUnit[key] = data[key].replace('${workspaceRoot}', projectPath)
            }
          }
          body.data.mockData.push(mockUnit)
        })
      }
      if(config.hasOwnProperty('mockModules')) {
        config.mockModules.forEach((module) => {
          body.data.mockModules.push(module)
        })
      }
    }

    let payload = {
      url: MOCK_DATA_URL.replace('PORT', atom.config.get('weex-run.dumplingPort')),
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: body
    }

    return payload
  }

  function _sendConfig (msg) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), HTTP_SEND_MSG, msg)
  }

  return {
    init: init
  }
})()

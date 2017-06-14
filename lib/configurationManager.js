'use babel'
'use strict'

const path = require('path')
const fsp = require('fs-promise')

const PROJECT_ROOT = /\${workspaceRoot}/g
const ATTACH_RESOURCE = /\${attachPackage}/g

class ConfigurationManager {
  getWatchFilePath () {
    const _this = this
    return this._getConfigObject()
      .then((configObject) => {
        return _this._parse(configObject.main)
      })
  }

  getConfig () {
    const _this = this
    return this._getConfigObject()
      .then((configObject) => {
        let configString = JSON.stringify(configObject)
        return JSON.parse(_this._parse(configString))
      })
  }

  getLaunchConfig () {
    const _this = this
    return this._getConfigObject()
      .then((configObject) => {
        if (!configObject) {
          throw new Error('configuration not found')
        } else {
          return {
            appid: configObject.launch.appid,
            path: _this._parse(configObject.launch.path)
          }
        }
      })
  }

  _getConfigObject () {
    if (!this.lanuchConfigPath) {
      let projectPath = this._projectPath()
      if (projectPath) {
        this.lanuchConfigPath = path.join(projectPath, '.thera', 'launch.json')
      } else {
        return Promise.resolve(undefined)
      }
    }

    return fsp.readJson(this.lanuchConfigPath)
  }

  _parse (value) {
    let projectPath = this._projectPath()
    return value.replace(PROJECT_ROOT, projectPath)
      .replace(ATTACH_RESOURCE, path.join(atom.config.resourcePath, '..', 'attach-resources'))
  }

  _projectPath () {
    let projectPath
    if (atom.project.getDirectories()[0]) {
      projectPath = atom.project.getDirectories()[0].path
    }
    return projectPath
  }
}

module.exports = new ConfigurationManager()

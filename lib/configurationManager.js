'use babel'
'use strict'

const path = require('path')
const fsp = require('fs-promise')

const PROJECT_ROOT = '${workspaceRoot}'
const ATTACH_RESOURCE = '${attachPackage}'

class ConfigurationManager {
  getWatchFilePath () {
    const _this = this
    return this._getConfigObject()
      .then((configObject) => {
        return _this._parse(configObject.main)
      })
  }

  getLaunchConfig () {
    const _this = this
    return this._getConfigObject()
      .then((configObject) => {
        return {
          appid: configObject.appid,
          path: _this._parse(configObject.path)
        }
      })
  }

  _getConfigObject () {
    if (!this.lanuchConfigPath) {
      let projectPath = this._projectPath()
      this.lanuchConfigPath = path.join(projectPath, '.thera', 'launch.json')
    }

    return fsp.readJson(this.lanuchConfigPath)
  }

  _parse (value) {
    let projectPath = this._projectPath()
    return value.replace(PROJECT_ROOT, projectPath)
      .replace(ATTACH_RESOURCE, path.join(atom.config.resourcePath, '..', 'attach-resources'))
  }

  _projectPath () {
    return atom.project.getDirectories()[0].path
  }
}

module.exports = new ConfigurationManager()

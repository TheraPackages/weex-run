'use strict'
'use babel'

const path = require('path')
const childProcess = require('child_process')
const fs = require('fs')
const EventEmitter = require('events')

const agentName = 'dumplings'
const serverStartedFlag = '@ali/begg started'
const consoleCommandName = 'server:log'

module.exports = class PreviewServer extends EventEmitter {
  boot (fouseStart = false) {
    return new Promise((resolve, reject) => {
      let that = this
      this.stop(() => {
        that._boot(resolve, reject)
      })
    })
  }

  _boot (resolve, reject) {
    const agentPath = atom.packages.resolvePackagePath(agentName) ||
      path.join(process.resourcesPath, 'attach-package', 'dumplings')
    console.log(`dumplings path ${agentPath}`)
    const nodePath = this.getCommandPath('node')
    let environment = process.env
    environment.DUMPLINGSPORT = atom.config.get('weex-run.dumplingPort')
    let child = childProcess.spawn(
      nodePath,
      [path.join(agentPath, 'server.js')],
      {cwd: agentPath, env: environment})
    this.dumplingProcess = child

    // fetch logs
    child.stdout.on('data', (data) => {
      if (data.toString().includes(serverStartedFlag)) {
        this.emit('start')
        resolve()
      }
      console.log(data.toString())
      atom.commands.dispatch(atom.views.getView(atom.workspace),
        consoleCommandName,
        {first: () => data.toString(), last: () => 'INFO'})
    })

    child.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    child.on('close', (code, signal) => {
      this.dumplingProcess = null
      this.emit('close')
      console.log(`dumplings terminated due to receipt of signal ${signal}`)
    })
  }

  stop (callback) {
    let that = this
    this.findSurvivalAgent((pids) => {
      that.killProcess(pids || [], callback)
    })
  }

  // find survival pids by `ps` names
  findSurvivalAgent (callback) {
    childProcess.exec(
      `ps -ef | grep ${agentName}`,
      (error, stdout) => {
        if (error) {
          console.warn('find survival agent process failed', error)
        }

        const survivals = stdout.split('\n')
          .filter(e => !e.includes(' grep ') && e.includes(agentName))
          .map(v => v.split(' ').filter(e => e.length !== 0))
          .reduce(
            (previousValue, currentValue) => {
              let pid = currentValue[1]
              previousValue.push(pid)
              return previousValue
            }, [])

        console.log('survivals: ' + survivals)
        callback(survivals)
      })
  }

  // kill all processes in pid list, callback after all set.
  killProcess (pids, callback) {
    let ps = []

    pids.forEach((pid) => {
      ps.push(new Promise((resolve, reject) => {
        childProcess.exec(
          `kill -9 ${pid}`,
          (error, stdout) => {
            if (error) {
              console.warn(`kill survival ${pid} process failed` + error.message)
              // reject()
            } else {
              console.log(`dumpling survival ${pid} killed`)
            }
            resolve()
          })
      }))
    })

    Promise.all(ps).then(callback)
  }

  // get command by name. eg. `npm` `apm` `node`
  getCommandPath (commandName) {
    if (process.platform === 'win32') {
      commandName += '.cmd'
    }

    let apmRoot = path.join(process.resourcesPath, 'app', 'apm')
    let commandPath = path.join(apmRoot, 'bin', commandName)

    try {
      if (!fs.statSync(commandPath)) {
        commandPath = path.join(apmRoot, 'node_modules', 'atom-package-manager', 'bin', commandName)
      }
    } catch (e) {
      // apmPath not exist
      if (e.code === 'ENOENT') {
        commandPath = path.join(apmRoot, 'node_modules', 'atom-package-manager', 'bin', commandName)
      }
    }

    return commandPath
  }

  getDumplingProcess () {
    return this.dumplingProcess
  }
}

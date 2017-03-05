'use babel'
'use strict'

// const request = require('request')
const path = require('path')
const childProcess = require('child_process')

const defaultUDID = 'weex-run.defaultUDID'
const SELECT_DEVICE = 'thera-simulator-selector'
const GENERIC_DEVICE = 'GenericDevice'

// const defaultDeviceName = 'iPhone 6'
// const reqSimulatorList = 'http://localhost:7001/iOSSimluatorList'

module.exports = class SimulatorManager {
  static genericDevice () { return GENERIC_DEVICE }
  static IOSSimulator () { return 'IOSSimulator' }

  start () {
    return new Promise((resolve, reject) => {
      if (this.selectedDeviceUDID() !== GENERIC_DEVICE) {
        // start simulator with selected udid
        this.curDeviceID().then((udid) => {
          if (udid) {
            let appPath = path.join(atom.config.resourcePath, '..', 'attach-resources', 'Preview.app')
            console.log(`start preview app udid ${udid} at ${appPath}`)
            childProcess.execFile(
              path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'deploy.sh'),
              [udid, appPath, atom.config.get('weex-run.dumplingPort')],
              (err, stdout) => {
                if (err) reject(err)
                else resolve(SimulatorManager.IOSSimulator())
              }
            )
          }
        }, reject)
      } else {
        // run on generic device
        resolve(SimulatorManager.genericDevice())
      }
    })
  }

  // get current device id
  curDeviceID () {
    let _this = this
    return new Promise((resolve, reject) => {
      _this.getSimulators().then((simulators) => {
        let avaliables = _this.availableSimulator(simulators)
        let defaultDevice = _this.defaultDevice(avaliables)
        resolve(defaultDevice.udid)
      }, reject)
    })
  }

  // get all available device names
  devicesList () {
    let _this = this
    return new Promise((resolve, reject) => {
      _this.getSimulators().then((simulators) => {
        let avaliables = _this.availableSimulator(simulators)
        let devices = avaliables.reduce((pre, cur, index) => {
          pre.push({
            name: cur.fullname,
            udid: cur.udid})
          return pre
        }, [])
        resolve(devices)
      }, reject)
    })
  }

  // request localhost server, get simulators list
  getSimulators () {
    let _this = this
    return new Promise((resolve, reject) => {
      // cache simulators
      if (_this.simulators) {
        resolve(_this.simulators)
      } else {
        // fix issues #55
        // support xcrun simctl list
        childProcess.exec('xcrun --version', (error, stdout, stderr) => {
          if (error) reject(error)
          else {
            console.log(stdout)
            childProcess.exec('xcrun simctl list -j', (error, stdout, stderr) => {
              if (error) reject(error)
              else {
                _this.simulators = JSON.parse(stdout)
                resolve(_this.simulators)
              }
            })
          }
        })
      }
    })
  }

  availableSimulator (simulators) {
    let devices = []
    Object.keys(simulators.devices).forEach((key) => {
      if (!simulators.devices.hasOwnProperty(key)) return
      simulators.devices[`${key}`].forEach((d) => {
        d.system = key
        d.fullname = `${d.name}(${d.system})`
        devices.push(d)
      })
    })

    // only support iphone device
    return devices.filter(v => v.availability === '(available)').filter(v => v.name.includes('iPhone'))
  }

  selectedDeviceUDID () {
    let index = atom.document.getElementById(SELECT_DEVICE).selectedIndex || 0
    let udid = atom.document.getElementById(SELECT_DEVICE).options[index].value
    return udid
  }

  defaultDevice (devices) {
    let udid = this.selectedDeviceUDID()

    if (udid !== undefined) {
      let d = devices.filter(v => v.udid === udid)
      if (d.length > 0) return d[0]
    } else {
      throw new Error('cannot find selected device!')
    }
  }

  load () {
    let udid = atom.config.get(defaultUDID)
    let selector = atom.document.getElementById(SELECT_DEVICE)
    Object.keys(selector.options).forEach((key, index) => {
      if (selector.options.hasOwnProperty(key)) {
        if (selector.options[key].value === udid) {
          selector.selectedIndex = key
        }
      }
    })
    selector.onchange = this.save
  }

  save () {
    let selector = atom.document.getElementById(SELECT_DEVICE)
    let udid = selector[selector.selectedIndex].value
    atom.config.set(defaultUDID, udid)
  }
}

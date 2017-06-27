'use babel'
'use strict'

const path = require('path')
const childProcess = require('child_process')
const configurationManager = require('./configurationManager')
const ip = require('ip')
const fs = require('fs')

const defaultUDID = 'weex-run.defaultUDID'
const SELECT_DEVICE = 'thera-simulator-selector'
const GENERIC_DEVICE = 'GenericDevice'
const IOS_SIMULATOR = 'iOSSimulator'
const ANDROID_SIMULATOR = 'androidSimulator'
var adbPath = undefined
var emuPath = undefined

module.exports = class SimulatorManagerUtil {

  constructor() {
    this.android = {
      actEmuName: null
    }
  }

  start (device) {
    const _this = this
    return new Promise((resolve, reject) => {
      const {udid, name, type} = device

      if (type === GENERIC_DEVICE) {
        resolve(GENERIC_DEVICE)
      } else if (type === IOS_SIMULATOR) {
        // start simulator with selected udid
        configurationManager.getLaunchConfig()
          .then((launch) => {
            let appPath = launch.path
            let appid = launch.appid
            console.log(`start preview app udid ${udid} at ${appPath}`)
            console.log(`${path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'deploy.sh')}
            ${udid} ${appPath} ${atom.config.get('weex-run.dumplingPort')} ${appid} ${atom.config.get('weex-run.XcodeHome')}`)
            childProcess.execFile(
              path.join(atom.packages.loadedPackages['weex-run'].path, 'script', 'deploy.sh'),
              [udid, appPath, atom.config.get('weex-run.dumplingPort'), appid, atom.config.get('weex-run.XcodeHome')],
              (err, stdout) => {
                if (err) {
                  console.error('start iOS simulator error.', err)
                  reject(err)
                } else {
                  resolve(IOS_SIMULATOR)
                }
              }
            )
          }, reject)
      } else if (type === ANDROID_SIMULATOR) {
        let appPath, appid
        configurationManager.getConfig()
          .then((config) => {
            appPath = config.launch.pathAndroid
            appid = config.launch.appidAndroid
            console.log('Android simulator config: ', appPath, appid)
          }).then(() => {
            return _this._killOtherRunningEmulator(name);
          }).then(() => {
            return _this._startAndroidEmulator(name)
          }).then(() => {
            return _this.installAndroidApp(appPath)
          }).then(() => {
            return _this.launchAndroidApp(appid)
          }).then(() => {
            return _this.notifyAndroidServerAddress(name, `${ip.address()}:${atom.config.get('weex-run.dumplingPort')}`)
          }).then(() => resolve(ANDROID_SIMULATOR))
            .catch((error)=>reject(error))
      }
    })
  }

  stop (udid) {
    let bootedUDID = udid
    // Stop the current preview app
    if (udid === this.android.actEmuName) {
      childProcess.exec(`adb -e shell ps | grep com.alibaba.falcon | awk '{print $2}' | xargs adb -e shell kill`,
        (error, stdout, stderr) => {
          if (error) {
            console.error('Kill android preview application error', error, stdout, stderr)
          } else {
            console.log('Kill android preview application success.')
          }
      });
    } else if (GENERIC_DEVICE !== bootedUDID) {
      // xcrun simctl terminate 6F2948A4-462E-48FE-A08A-15E77851BF05 com.taobao.preview
      configurationManager.getLaunchConfig()
        .then((configObject) => {
          let iOSHomePath = atom.config.get('weex-run.XcodeHome') || '/Applications/XCode.app'
          console.log(`${iOSHomePath}/Contents/Developer/usr/bin/simctl terminate ${bootedUDID} ${configObject.appid}`)
          childProcess.exec(`${iOSHomePath}/Contents/Developer/usr/bin/simctl terminate ${bootedUDID} ${configObject.appid}`)
        })
    }
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
    const _this = this
    let pIosDevices

    if (process.platform === 'darwin') {
      pIosDevices = this._getSimulators()
      .then((simulators) => {
        let avaliables = _this._availableSimulator(simulators)
        let devices = avaliables.reduce((pre, cur, index) => {
          pre.push({
            name: cur.fullname,
            udid: cur.udid,
            type: IOS_SIMULATOR,
            isSimulator:1
          })
          return pre
        }, [])
        return devices
      })
      .catch((reason) => {
        atom.commands.dispatch(atom.views.getView(atom.workspace),
          'atom-notifier:sendMsg',
          {type: 'warning', message: reason.message})
        return []
      })
    } else {
      pIosDevices = Promise.resolve([])
    }

    return Promise.all([pIosDevices, this._listAndroidEmulators()])
      .then(([ios, android]) => {
        return ios.concat(android)
      })
  }

  // request 127.0.0.1 server, get simulators list
  _getSimulators () {
    let _this = this

    return new Promise((resolve, reject) => {
      // fix issues #55
      // support xcrun simctl list
      childProcess.exec('xcrun --version', (error, stdout, stderr) => {
        console.log(stdout)
        let version = stdout.match(/\w+(\d+)/g)
        if (error) {
          reject(new Error('Load ios simulator failed, Xcode not found'))
        } else if (version < 29) {
          reject(new Error(`Load ios simulator failed, xcrun version ${version}, plz update XCode`))
        } else {
          let iOSHomePath = atom.config.get('weex-run.XcodeHome') || '/Applications/XCode.app'
          atom.config.set('weex-run.XcodeHome', iOSHomePath)
          const simctlPath = iOSHomePath + '/Contents/Developer/usr/bin/simctl'
          childProcess.exec(iOSHomePath + '/Contents/Developer/usr/bin/simctl list -j', (error, stdout, stderr) => {
            if (error) {
              console.warn(stderr)
              reject(new Error(`Get simulator list failed, make sure ${iOSHomePath} installed, or set XCode path in weex-run settings.`))
            } else {
              _this.simulators = JSON.parse(stdout)
              resolve(_this.simulators)
            }
          })
        }
      })
    })
  }

  _availableSimulator (simulators) {
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

  _selectedDeviceUDID () {
    let index = atom.document.getElementById(SELECT_DEVICE).selectedIndex || 0
    let udid = atom.document.getElementById(SELECT_DEVICE).options[index].value
    return udid
  }

  _selectedDevice () {
    let index = atom.document.getElementById(SELECT_DEVICE).selectedIndex || 0
    let option = atom.document.getElementById(SELECT_DEVICE).options[index]
    return {
      name: option.label,
      udid: option.value,
      type: option.attributes.type.nodeValue
    }
  }

  _defaultDevice (devices) {
    let udid = this._selectedDeviceUDID()

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

  /**
   * @return {Promise}
   */
  _listAndroidEmulators () {
    return new Promise((resolve, reject) => {

      // Try to find android home. Load time of process.env may be a bit later.
      var tryCounter = 20;
      (function tryTask() {
        initAndroidHome();
        if (adbPath) {                // Env ok
          doGet();
        } else if (--tryCounter > 0) {  // Wait a moment
          setTimeout(tryTask, 200);
        } else {                      // Give up..
          console.error("ANDROID_HOME hasn't configed.");
          resolve([]);
        }
      })();

      function doGet () {
        childProcess.exec(`${emuPath} -list-avds`, (error, stdout, stderr) => {
          if (error) {
            console.error(error, stdout, stderr)
            resolve([])
          } else {
            let names = (stdout || '').trim().split('\n') // Emulator name list
            let emulators = names.map((n) => {
              return {
                name: n,
                udid: n,
                type: ANDROID_SIMULATOR
              }
            })
            resolve(emulators)
          }
        })
      }
    })
  }

  /**
   * Kill running emulator if start a new one.
   * @param {String} name New emulator name like: Nexus_5_API_23_2
   */
  _killOtherRunningEmulator (emulatorName) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (self.android.actEmuName === emulatorName) {
        console.log(`Emulator ${emulatorName} is running.`)
        resolve('Emulator is running.');
      } else {
        childProcess.exec(`${adbPath} devices -l`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Check if existing emulator error:`, error)
            resolve('Check error.');
          } else {
            var numEmu = self._countEmulator(stdout)
            if (numEmu > 0) {
              console.log("Kill all living emulators")
              doKill()
            } else {
              resolve()
            }
          }
        });

        function doKill() {
          // Just kill them all no matter who are they.
          childProcess.exec(`${adbPath} emu kill`, (error, stdout, stderr) => {
            if (error) {
              console.error("Kill living emulators error: ", error, stdout, stderr);
            }
            resolve('Kill all living emulators.')
          })
        }
      }
    })
  }

  /**
   * @param {string} emulatorName
   * @return {Promise}
   */
  _startAndroidEmulator (emulatorName) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (!emulatorName) {
        reject('Android emulator name should not be empty')
      } else {
        startIfNoLiveEmulator(resolve, reject)
      }
      // Remember current emulator name.
      self.android.actEmuName = emulatorName

      /* Only start when no emulator is running. */
      function startIfNoLiveEmulator (resolve, reject) {
        childProcess.exec(`${adbPath} devices -l`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Check if existing emulator error:`, error)
          } else {
            console.log('Check if existing emulator result:', stdout)
            var numEmu = self._countEmulator(stdout);
            if (numEmu > 0) {
              resolve(`Host has run ${numEmu} emulators. Use them instead of launching a new on.`)
            } else {
              doStart(resolve, reject)
            }
          }
        })
      }

      /** Do start emulator command */
      function doStart (resolve, reject) {
        console.log("Starting emulator: " + emulatorName);
        childProcess.exec(`${emuPath} -avd ${emulatorName}`, (error, stdout, stderr) => {
          self.android.actEmuName = null;
          if (error) {
            console.error(`Android emulator ${emulatorName} cannot be started:`, error)
          } else {
            console.log('Android emulator has shutdown.', stdout)
          }
        })
        checkIfCompleted(resolve, reject, 0)
      }

      /** Start emulator timeout 60 seconds. */
      function checkIfCompleted (resolve, reject, counter) {
        var interval = 2000
        var timeout = 50 * 1000
        var delay = counter === 0 ? 16000 : interval
        var timeElapse = (counter > 0 ? (16000 - interval) : 0) + counter * interval
        if (timeElapse > timeout) {
          reject('Start emulator timeout. Discard!')
          return
        } else {
          console.log('Check if completely started, time elapse = ' + timeElapse)
        }
        setTimeout(function () {
          counter++
          childProcess.exec(`${adbPath} -e shell getprop init.svc.bootanim`, (error, stdout, stderr) => {
            if (error) {
              console.error('Check if completed error:', error)
              checkIfCompleted(resolve, reject, counter)
            } else if ((stdout || '').startsWith('stopped')) {
              console.log('Check if completed successfully:', stdout)
              resolve('Android emulator has completed started.' + stdout)
            } else {
              console.log('Check if completed nearly finished!', stdout)
              checkIfCompleted(resolve, reject, counter)
            }
          })
        }, delay)
      }
    })
  }

  /**
   * List of devices attached
   * emulator-5554     device product:sdk_google_phone_x86 model:Android_SDK_built_for_x86 device:generic_x86
   * DU2SSE146R014140  device usb:337641472X product:H60-L01 model:H60_L01 device:hwH60
   */
  _countEmulator (adbDevicesL) {
    var lines = (adbDevicesL || '').trim().split('\n')
    var numEmu = 0
    lines.forEach((line, i) => {
      if (/emulator/g.test(line) && !/usb/g.test(line)) {
        numEmu++
      }
    })
    return numEmu;
  }

  installAndroidApp (apkName) {
    return new Promise(function (resolve, reject) {
      childProcess.exec(`${adbPath} -e install -r -t -g ${apkName}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error('Install android apk error:', error, stdout, stderr)
            reject('Install android apk error: ' + error)
          } else {
            var lines = (stdout || '').split('\n') || []
            var simple = lines.last(6).join('\n')
            if (/Failure/g.test(simple)) {
              console.error('Install android apk faild: ', simple)
            } else {
              console.log('Install android apk successfully: ', simple)
            }
            resolve('Install android apk finished.')  // Skip to the next step
          }
        }
      )
    })
  }

  launchAndroidApp (pageName) {
    return new Promise(function (resolve, reject) {
      childProcess.exec(`${adbPath} -e shell am start -n ${pageName}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error('Launch android app error:', error, stdout, stderr)
            reject('Launch android app error: ' + error)
          } else {
            if (/Error/g.test(stdout)) {
              console.error('Launch android app error:', stdout)
            } else {
              console.log('Launch android apk successfully:', stdout)
            }
            resolve('Launch android app finished.')   // Skip to the next step
          }
        }
      )
    })
  }

  notifyAndroidServerAddress (name, hostPort) {
    return new Promise(function (resolve, reject) {
      var configStr = JSON.stringify({
        deviceName: name,
        previewServerAddress: hostPort
      })
      console.log(configStr)

      var cacheFile = path.join(atom.configDirPath, 'android.confg')
      var fStream = fs.createWriteStream(cacheFile, { encoding: 'utf8' })
      fStream.on('finish', function() {
        onWriteFinished()
      });
      fStream.write(configStr);
      fStream.end();

      function onWriteFinished() {
        childProcess.exec(`${adbPath} -e root && ${adbPath} -e push ${cacheFile} /data/data/com.alibaba.falcon/files/android.conf`,
          (error, stdout, stderr) => {
            if (error) {
              console.error('Notify Android emulator error:' + error)
              reject('Notify Android emulator error:' + error)
            } else {
              console.log('Notify Android emulator sucessfully: ', stdout)
              resolve('Notify Android emulator successfully: ' + stdout)
            }
          }
        )
      }
    });
  }
}

function initAndroidHome() {
  const AHOME_CONFIG = 'weex-run.AndroidHome';
  var androidHome = process.env.ANDROID_HOME ? process.env.ANDROID_HOME : atom.config.get(AHOME_CONFIG);
  if (atom.config.get(AHOME_CONFIG) !== androidHome) {
    atom.config.set(AHOME_CONFIG, androidHome);
  }
  if (androidHome) {
    console.log('ANDROID_HOME: ' + androidHome);
    adbPath = path.join(androidHome, 'platform-tools', 'adb');
    emuPath = path.join(androidHome, 'tools', 'emulator');
  } else {
    console.warn('Cannot find ANDROID_HOME env!');
    atom.config.set(AHOME_CONFIG, '');
  }
}

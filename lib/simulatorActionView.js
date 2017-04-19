'use babel';
'use strict'

const SimulatorManagerUtil = require('./simulatorManagerUtil')
const {dialog} = require('electron').remote


const stopIcon = 'https://img.alicdn.com/tfs/TB17ba9QFXXXXa7apXXXXXXXXXX-48-48.png'
const startIcon = 'https://img.alicdn.com/tfs/TB19cHEQFXXXXaqXFXXXXXXXXXX-48-48.png'
const startingIcon = 'https://img.alicdn.com/tfs/TB1Jz_kQFXXXXX1apXXXXXXXXXX-150-150.gif'

module.exports = class SimulatorActionView {
    constructor(deviceJson) {
        this.simulatorManagerUtil = new SimulatorManagerUtil()
        this.isStarted = false
        this.deviceJson = deviceJson
        return this.createView()
    }

    createView() {
        var img = document.createElement('img');
        img.className = 'weex_run_stop_icon'
        img.src = startIcon;
        img.isStarted = false;
        var _this = this;

        img.onclick = function () {
            if (_this.isStarted) {
                _this.simulatorManagerUtil.stop(_this.deviceJson.udid)
                _this.isStarted = false;
                this.src = startIcon;
            } else {
                this.src = startingIcon;
                _this.simulatorManagerUtil.start(_this.deviceJson).then(()=> {
                    _this.isStarted = true;
                    this.src = stopIcon;
                }).catch((error)=> {
                    _this.isStarted = false;
                    this.src = startIcon;
                    dialog.showErrorBox('start failed', error.toString() + ' You can get more detail info from console log.');
                })
            }
        }
        return img;
    }


    start() {
        this.simulatorManagerUtil.start(this.deviceJson)
    }

    stop() {
        this.simulatorManagerUtil.stop(this.deviceJson.udid)
    }

}
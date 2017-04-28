'use babel';
'use strict'

const SimulatorManagerUtil = require('./simulatorManagerUtil')
const {dialog} = require('electron').remote
const simulatorInfo = require('./simulatorInfo')

const stopIcon = 'https://img.alicdn.com/tfs/TB17ba9QFXXXXa7apXXXXXXXXXX-48-48.png'
const startIcon = 'https://img.alicdn.com/tfs/TB19cHEQFXXXXaqXFXXXXXXXXXX-48-48.png'
const startingIcon = 'https://img.alicdn.com/tfs/TB1Jz_kQFXXXXX1apXXXXXXXXXX-150-150.gif'


module.exports = class SimulatorActionView {
    constructor(deviceJson,tr) {
        this.simulatorManagerUtil = new SimulatorManagerUtil()
        this.isStarted = false
        this.deviceJson = deviceJson
        this.tr = tr
        return this.createView()
    }

    createView() {
        this.img = document.createElement('img');
        this.img.className = 'weex_run_stop_icon'
        this.img.src = startIcon;
        this.img.isStarted = false;
        var _this = this;

        this.img.onclick = function () {
            if (_this.isStarted) {
                _this.stop(this);
            } else {
                _this.start(this)
            }
        }
        return this.img;
    }

    stop(){
        this.img.className = 'weex_run_stop_icon'
        this.simulatorManagerUtil.stop(this.deviceJson.udid)
        this.isStarted = false;
        this.img.src = startIcon;

        simulatorInfo.popSimulator(this)
    }

    start(){
        this.img.src = startingIcon;
        this.img.className = 'weex_run_start_icon'
        return this.simulatorManagerUtil.start(this.deviceJson).then(()=> {
            this.stopOtherSimulator();
            this.isStarted = true;
            this.img.src = stopIcon;

            simulatorInfo.pushSimulator(this)
            simulatorInfo.setCurrentSimulator(this);
        }).catch((error)=> {
            this.isStarted = false;
            this.img.src = startIcon;
            dialog.showErrorBox('start failed', error.toString() + ' You can get more detail info from console log.');
        })
    }

    stopOtherSimulator(){
        simulatorInfo.getStartedSimulatorArray().forEach(function (actionView) {
            if(actionView != this) actionView.stop()
        })
        simulatorInfo.cleanStartedSimulatorArray()
    }
    
}
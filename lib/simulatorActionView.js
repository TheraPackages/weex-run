'use babel';
'use strict'

const SimulatorManagerUtil = require('./simulatorManagerUtil')
const {dialog} = require('electron').remote
const simulatorInfo = require('./simulatorInfo')


module.exports = class SimulatorActionView {
    constructor(deviceJson,tr) {
        this.simulatorManagerUtil = new SimulatorManagerUtil()
        this.isStarted = false
        this.deviceJson = deviceJson
        this.tr = tr
        return this.createView()
    }

    createView() {
        this.runIcon = document.createElement('i')
        this.setRunIcon(false)
        var _this = this;

        this.runIcon.onclick = function () {
            if (_this.isStarted) {
                _this.stop(this);
            } else {
                _this.start(this)
            }
        }
        return this.runIcon;
    }

    stop(){
        this.setRunIcon(false)
        this.simulatorManagerUtil.stop(this.deviceJson.udid)
        simulatorInfo.popSimulator(this)
    }

    start(){
        $(this.runIcon).attr('class','fa fa-3x fa-spinner fa-spin weex_run_start_icon')
        return this.simulatorManagerUtil.start(this.deviceJson).then(()=> {
            this.stopOtherSimulator();
            this.setRunIcon(true)
            simulatorInfo.pushSimulator(this)
            simulatorInfo.setCurrentSimulator(this);
        }).catch((error)=> {
            this.setRunIcon(false)
            dialog.showErrorBox('start failed', error.toString() + ' You can get more detail info from console log.');
        })
    }

    stopOtherSimulator(){
        simulatorInfo.getStartedSimulatorArray().forEach(function (actionView) {
            if(actionView != this) actionView.stop()
        })
        simulatorInfo.cleanStartedSimulatorArray()
    }

    setRunIcon(isStarted){
        this.isStarted = isStarted;
        if(isStarted){
            $(this.runIcon).attr('class','fa fa-stop weex_run_stop_icon')
        } else {
            $(this.runIcon).attr('class','fa fa-play weex_run_start_icon')
        }
    }
    
}
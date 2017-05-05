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
        this.udid = deviceJson.udid
        this.tr = tr
        this.isRunning = false
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
        simulatorInfo.pushToAllSimulator(this)
        return this.runIcon;
    }

    stop(){
        if(this.isStarted) {
            this.setRunIcon(false)
            this.simulatorManagerUtil.stop(this.deviceJson.udid)
            simulatorInfo.popFromStartedSimulator(this)
        }
    }

    start(){
        $(this.runIcon).attr('class','fa fa-spinner fa-pulse fa-1x fa-fw weex_run_running_icon')
        this.isRunning = true
        return this.simulatorManagerUtil.start(this.deviceJson).then(()=> {
            this.isRunning = false
            this.stopOtherSimulator();
            this.setRunIcon(true)
            simulatorInfo.pushToStartedSimulator(this)
            simulatorInfo.setCurrentSimulator(this);
        }).catch((error)=> {
            this.isRunning = false
            this.setRunIcon(false)
            dialog.showErrorBox('start failed', error.toString() + ' You can get more detail info from console log.');
        })
    }

    stopOtherSimulator(){
        var _this = this
        simulatorInfo.getStartedSimulatorArray().forEach(function (actionView,udid,map) {
            if(actionView != _this && actionView.deviceJson.type == _this.deviceJson.type) {
                actionView.stop()
                simulatorInfo.popFromStartedSimulator(udid)
            }
        })
    }

    setRunIcon(isStarted){
        if(this.isRunning) return
        this.isStarted = isStarted;
        if(isStarted){
            $(this.runIcon).attr('class','fa fa-stop weex_run_stop_icon')
            simulatorInfo.pushToStartedSimulator(this)
        } else {
            $(this.runIcon).attr('class','fa fa-play weex_run_start_icon')
            simulatorInfo.popFromStartedSimulator(this)
        }
    }
    
}
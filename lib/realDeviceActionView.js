'use babel';
'use strict'

const realDeviceInfo = require('./realDeviceInfo')
window.$ = window.jQuery = require('jquery');


module.exports = class RealDeviceActionView {
    constructor(tr,deviceJson, isConnected) {
        this.isConnected = isConnected
        this.deviceJson = deviceJson
        this.udid = deviceJson.udid
        this.tr = tr
    }

    createView() {
        this.connectCondition = document.createElement('i')
        if (this.isConnected) {
            this.connect()
        } else {
            this.disConnect()
        }
        $(this.connectCondition).tooltip({
            tooltipClass: "deviceActionIconToolTip"
        });
        return this.connectCondition;
    }

    connect() {
        $(this.connectCondition).attr('class','fa fa-link weex_run_start_icon')
        realDeviceInfo.pushRealDevice(this)
        this.connectCondition.title = this.deviceJson.name+' is connected'
    }

    disConnect() {
        $(this.connectCondition).attr('class','fa fa-chain-broken weex_run_stop_icon')
        this.connectCondition.title = this.deviceJson.name+' is disconnected'
    }

}
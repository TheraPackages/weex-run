'use babel';
'use strict'

const realDeviceInfo = require('./realDeviceInfo')
window.$ = window.jQuery = require('jquery');


module.exports = class RealDeviceActionView {
    constructor(deviceJson, isConnected) {
        this.isConnected = isConnected
        this.deviceJson = deviceJson
    }

    createView() {
        this.connectCondition = document.createElement('i')
        if (this.isConnected) {
            this.connect()
        } else {
            this.disConnect()
        }
        return this.connectCondition;
    }

    connect() {
        $(this.connectCondition).attr('class','fa fa-link weex_run_start_icon')
        realDeviceInfo.pushRealDevice(this)
    }

    disConnect() {
        $(this.connectCondition).attr('class','fa fa-chain-broken weex_run_stop_icon')
    }

}
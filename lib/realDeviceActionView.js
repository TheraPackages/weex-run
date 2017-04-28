'use babel';
'use strict'

const realDeviceInfo = require('./realDeviceInfo')
window.$ = window.jQuery = require('jquery');


module.exports = class RealDeviceActionView {
    constructor(deviceJson, isConnected) {
        this.isConnected = isConnected
        this.deviceJson = deviceJson
        return this.createView()
    }

    createView() {
        this.connectCondition = document.createElement('i')
        $(this.connectCondition).addClass('fa fa-link').addClass('weex_run_start_icon')
        if (this.isConnected) {
            this.connect()
        } else {
            this.disConnect()
        }
        return this.connectCondition;
    }

    connect() {
        $(this.connectCondition).addClass('fa fa-link').addClass('weex_run_start_icon')
        realDeviceInfo.pushRealDevice(this)
    }

    disConnect() {
        $(this.connectCondition).addClass('fa fa-chain-broken').addClass('weex_run_stop_icon')
    }

}
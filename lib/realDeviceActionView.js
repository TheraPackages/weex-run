'use babel';
'use strict'

const realDeviceInfo = require('./realDeviceInfo')
window.$ = window.jQuery = require('jquery');


module.exports = class RealDeviceActionView {
    constructor(tr, deviceJson, isConnected) {
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
        return this.connectCondition;
    }

    connect() {
        $(this.connectCondition).attr('class', 'fa fa-link weex_run_start_icon')
        realDeviceInfo.pushRealDevice(this)
        var connectTip = this.deviceJson.name + ' is connected'
        this.updateTooltip(connectTip)
    }

    disConnect() {
        $(this.connectCondition).attr('class', 'fa fa-chain-broken weex_run_stop_icon')
        var disConnectTip = this.deviceJson.name + ' is disconnected'
        this.updateTooltip(disConnectTip)
    }

    updateTooltip(text) {
        if ($(this.connectCondition).tooltip() != null) {
            $(this.connectCondition).tooltip('destroy');
        }
        this.connectCondition.title = text
        $(this.connectCondition).tooltip({
            tooltipClass: "deviceActionIconToolTip"
        })
    }

}
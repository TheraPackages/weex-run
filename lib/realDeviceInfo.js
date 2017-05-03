'use strict'
'use babel'


module.exports = (function () {
    var historyRealDeviceViewArray = new Map()
    
    function pushRealDevice(deviceActionView) {
        historyRealDeviceViewArray.set(deviceActionView.udid,deviceActionView)
    }

    function popRealDevice(deviceActionView) {
        historyRealDeviceViewArray.delete(deviceActionView.udid);
    }

    function getHistoryRealDeviceArray() {
        return historyRealDeviceViewArray;
    }

    function cleanHistoryRealDeviceArray() {
        historyRealDeviceViewArray.clear()
    }

    function getDevice(udid) {
        return historyRealDeviceViewArray.get(udid)
    }


    return {
        pushRealDevice: pushRealDevice,
        popRealDevice: popRealDevice,
        getHistoryRealDeviceArray:getHistoryRealDeviceArray,
        cleanHistoryRealDeviceArray:cleanHistoryRealDeviceArray,
        getDevice:getDevice
    }
}())
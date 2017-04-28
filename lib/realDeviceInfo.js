'use strict'
'use babel'


module.exports = (function () {
    var historyRealDeviceViewArray = []
    
    function pushRealDevice(deviceActionView) {
        historyRealDeviceViewArray.push(deviceActionView)
    }

    function popRealDevice(deviceActionView) {
        historyRealDeviceViewArray.pop(deviceActionView);
    }

    function getHistoryRealDeviceArray() {
        return historyRealDeviceViewArray;
    }

    function cleanHistoryRealDeviceArray() {
        historyRealDeviceViewArray = []
    }

    return {
        pushRealDevice: pushRealDevice,
        popRealDevice: popRealDevice,
        getHistoryRealDeviceArray:getHistoryRealDeviceArray,
        cleanHistoryRealDeviceArray:cleanHistoryRealDeviceArray
    }
}())
'use babel';

window.$ = window.jQuery = require('jquery');

import DevicePanelView from './thera-device-panel-view';
const simulatorInfo = require('./simulatorInfo')
const realDeviceInfo = require('./realDeviceInfo')

const commandShowDevicePanel = 'thera-device-panel:show'
const commandDeviceConnected = 'dumpling-server:client-changed'

module.exports = class DevicePanel {
    activate(state) {
        // this.devicePanel = this.devicePanel || new DevicePanelView()

        atom.commands.add(atom.commands.rootNode, commandShowDevicePanel, () => this.show())
        atom.commands.add(atom.commands.rootNode, commandDeviceConnected, (event) => this.updateDeviceList(event.detail.data))
    }
    

    deactivate() {
        this.devicePanelView.destroy();
    }


    show() {
        this.devicePanel = this.devicePanel || new DevicePanelView()
        console.log(this.devicePanel);
        this.devicePanel.show()
        this.frontCurrentDevice();
    }

    frontCurrentDevice() {
        simulatorInfo.getStartedSimulatorArray().forEach(function(actionView,udid,map){
            if (actionView && actionView.tr) {
                var row = $(actionView.tr)
                var row1 = $(actionView.tr).closest('tbody').children().first()
                row.insertAfter(row1)
            }
        })
    }

    updateDeviceList(deviceList) {
        console.log('tingxiang devicelist ' + deviceList)
        var _this = this;
        //之前没有的要加上，之前启动的转状态是位启动的，需要设置为已启动(未链接／无 ==》已链接)
        if(_this.devicePanel && deviceList) {
            deviceList.some(function (deviceInfo) {
                var isSimulator = deviceInfo.issimulator
                if(isSimulator == 'true') return false

                var name = deviceInfo.devicename
                var udid = deviceInfo.udid
                var type = deviceInfo.platform

                var deviceActionView = realDeviceInfo.getDevice(udid)
                if(deviceActionView != null){
                    deviceActionView.connect()
                } else {
                    var json = {};
                    json['name'] = name;
                    json['type'] = type;
                    json['udid'] = udid;
                    _this.devicePanel.deviceTableView.insertRealDevice(json,true)
                }
            })
        }

        //之前已经有，状态是已经启动的，如果新的列表里面没有需要变成未链接(已链接 ==》未链接》)
        realDeviceInfo.getHistoryRealDeviceArray().forEach(function (deviceActionView,udid,map) {
            if(_this.isActionViewInDeviceList(udid,deviceList) == false){
                deviceActionView.disConnect()
            }
        })

        simulatorInfo.getAllSimulatorArray().forEach(function (simulatorActionView,udid,map) {
            if(_this.isActionViewInDeviceList(udid,deviceList)){
                simulatorActionView.setRunIcon(true)
            } else {
                simulatorActionView.stop()
            }
        })
    }


    isActionViewInDeviceList(udid,deviceList){
        var result =  false
        deviceList.some(function (deviceInfo) {
            var udidOfDevice = deviceInfo.udid
            if(udidOfDevice == udid)
                result = true
                return false
        })
        return result
    }




    
}
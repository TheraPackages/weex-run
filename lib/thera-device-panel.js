'use babel';

window.$ = window.jQuery = require('jquery');

import DevicePanelView from './thera-device-panel-view';
const simulatorInfo = require('./simulatorInfo')

const commandShowDevicePanel = 'thera-device-panel:show'
const commandDeviceConnected = 'console.targets'

module.exports = class DevicePanel {
    activate(state) {
        // this.devicePanel = this.devicePanel || new DevicePanelView()

        atom.commands.add(atom.commands.rootNode, commandShowDevicePanel, () => this.show())
        atom.commands.add(atom.commands.rootNode, commandDeviceConnected, (allDevices) => this.updateDeviceList(allDevices.detail))
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
        var currentSimulator = simulatorInfo.getCurrentSimulator()
        if (currentSimulator && currentSimulator.tr) {
            var row = $(currentSimulator.tr)
            var row1 = $(currentSimulator.tr).closest('tbody').children().first()
            row.insertAfter(row1)
        }
    }

    updateDeviceList(deviceList) {
        var _this = this;
        if(_this.devicePanel && deviceList) {
            deviceList.forEach(function (deviceInfo) {
                var name = deviceInfo.model
                var udid = deviceInfo.deviceId.split('|')[0]
                var type = deviceInfo.platform

                var json = {};
                json['name'] = name;
                json['type'] = type;
                json['udid'] = udid;

                _this.devicePanel.deviceTableView.insertRowAtFirst(json,true)
            })
        }

        simulatorInfo.getAllSimulatorArray().forEach(function (actionView) {
            // actionView.setRunIcon(true)
        })
    }
    
}
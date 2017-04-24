'use babel';

import DevicePanelView from './thera-device-panel-view';
const WeexRuner = require('./weex-run-util')
const simulatorInfo = require('./simulatorInfo')

const commandStart = 'thera-live-server:start'
const commandStop = 'thera-live-server:stop'
const commandDebug = 'thera-live-server:debug'
const commandShowDivicePanel = 'thera-device-panel:show'


module.exports = class DevicePanel {
    activate(state) {
        this.weexRunner = new WeexRuner()

        atom.commands.add(atom.commands.rootNode, commandStart, () => this.start())
        atom.commands.add(atom.commands.rootNode, commandStop, () => this.stopAllSimulator())
        atom.commands.add(atom.commands.rootNode, commandDebug, () => this.weexRunner.debug())
        atom.commands.add(atom.commands.rootNode, commandShowDivicePanel, () => this.show())
    }

    start() {
        if (simulatorInfo.getCurrentSimulator()) {
            simulatorInfo.getCurrentSimulator().start()
        }
        else {
            this.show()
        }
    }

    stopAllSimulator() {
        simulatorInfo.getStartedSimulatorArray().forEach(function (actionView) {
            actionView.stop()
        })
        simulatorInfo.cleanStartedSimulatorArray()
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

}



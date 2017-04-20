'use babel';

import DevicePanelView from './thera-device-panel-view';
import {CompositeDisposable} from 'atom';
const WeexRuner = require('./weex-run-util')
const simulatorInfo = require('./simulatorInfo')

const commandStart = 'thera-live-server:start'
const commandStop = 'thera-live-server:stop'
const commandDebug = 'thera-live-server:debug'
const commandQRCode = 'thera-live-server:qrcode'


module.exports = class DevicePanel {
    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'thera-device-panel:show': () => this.show()
        }));

        this.weexRunner = new WeexRuner()


        atom.commands.add(atom.commands.rootNode, commandStart, () => this.start())
        atom.commands.add(atom.commands.rootNode, commandStop, () =>  simulatorInfo.stopAllSimulator())
        atom.commands.add(atom.commands.rootNode, commandDebug, () => this.weexRunner.debug())
        atom.commands.add(atom.commands.rootNode, commandQRCode, () => this.weexRunner.qrcode())
    }

    start() {
        if (simulatorInfo.getCurrentSimulator()) {
            simulatorInfo.getCurrentSimulator().start()
        }
        else {
            this.show()
        }
    }
    
    deactivate() {
        this.subscriptions.dispose();
        this.devicePanelView.destroy();
    }


    show() {
        this.devicePanel = this.devicePanel || new DevicePanelView()
        console.log(this.devicePanel);
        this.devicePanel.show()
    }

}



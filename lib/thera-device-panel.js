'use babel';

import DevicePanelView from './thera-device-panel-view';
import { CompositeDisposable } from 'atom';
const WeexRuner = require('./weex-run-util')


module.exports = class DevicePanel{

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'thera-device-panel:show': () => this.show()
        }));
        
        this.runner = new WeexRuner()
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
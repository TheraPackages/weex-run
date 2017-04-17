'use babel';

import DevicePanelView from './views/thera-device-panel-view';
import { CompositeDisposable } from 'atom';

module.exports = class DevicePanel{

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'thera-device-panel:show': () => this.show()
        }));
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
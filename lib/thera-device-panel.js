'use babel';

import DevicePanelView from './views/thera-device-panel-view';
import { CompositeDisposable } from 'atom';

export default {

    devicePanelView: null,
    subscriptions: null,

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'thera-device-panel:toggle': () => this.toggle()
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
        this.devicePanelView.destroy();
    },

    serialize() {
        if (this.heraDevicePanelView != null) {
            return {
                theraDevicePanelViewState: this.devicePanelView.serialize()
            };
        }
    },


    toggle() {
        this.devicePanel = this.devicePanel || new DevicePanelView()
        console.log(this.devicePanel);
        this.devicePanel.show()
    }

};
'use babel';
'use strict'


window.$ = window.jQuery = require('jquery');
require ('jquery-ui')
const SimulatorManagerUtil = require('./simulatorManagerUtil')
const WeexRunUtil = require('./weex-run-util')
var prompt = 'All available simulators are shown as below. You can click the action icon to run one simulator. If you want to run or debug' +
    ' on your own cellphone, you can scan the QR code on right side with the preview app which can be downloaded from'

import DeviceTableView from './thera-device-table-view';
import DeviceExTableView from './thera-device-ex-table-view';


export default class DevicePanelView {

    constructor() {
        this.weexRunUtil = new WeexRunUtil();

        this.simulatorManagerUtil = new SimulatorManagerUtil()
        this.simulatorManagerUtil.devicesList().then((sims) => {
            var keys = ['name','type','udid']
            var img = this.weexRunUtil.qrcode();
            img.id = 'thera_device_panel_qr_view'

            this.deviceTableView = new DeviceTableView();

            var exTable = new DeviceExTableView(this.deviceTableView.createTable(prompt, keys, sims),img);

            exTable.onclick = function () {
                event.cancelBubble = true;
            }

            this.panel = atom.workspace.addModalPanel({
                item: exTable,
                visable: false
            })
            atom.views.getView(this.panel).classList.add('thera-device-modal-panel');
        })
    }


    show() {
        this.previousWindowClickEvent = window.onclick
        window.onclick = this.dismiss.bind(this)
        if(this.panel)  this.panel.show()
    }

    dismiss() {
        if(this.panel)  this.panel.hide()
        window.onclick = this.previousWindowClickEvent
    }

}
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
        // let dContainer = document.createElement('div')
        // dContainer.id = 'thera_device_panel_container';
        // dContainer.onclick = function () {
        //     event.cancelBubble = true;
        // }


        this.weexRunUtil = new WeexRunUtil();

        this.simulatorManagerUtil = new SimulatorManagerUtil()
        this.simulatorManagerUtil.devicesList().then((sims) => {
            var keys = ['name','type','udid']

            var table = new DeviceTableView(prompt, keys, sims);

            var img = this.weexRunUtil.qrcode();
            img.id = 'thera_device_panel_qr_view'

            var exTable = new DeviceExTableView(table,img);

            // dContainer.appendChild(exTable);
            //
            // $(dContainer).draggable();

            exTable.onclick = function () {
                event.cancelBubble = true;
            }

            this.panel = atom.workspace.addModalPanel({
                item: exTable,
                visable: false
            })
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
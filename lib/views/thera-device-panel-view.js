'use babel';
'use strict'


window.$ = window.jQuery = require('jquery');
require ('jquery-ui')


import DeviceTableView from './thera-device-table-view';
import DeviceExTableView from './thera-device-ex-table-view';


export default class DevicePanelView {

    constructor() {
        let dContainer = document.createElement('div')
        dContainer.id = 'thera_device_panel_container';
        dContainer.onclick = function () {
            event.cancelBubble = true;
        }
        this.panel = atom.workspace.addModalPanel({
            item: dContainer,
            visable: false
        })

        var employees = [
            {"firstName": "Bill", "lastName": "Gates", "age": "23", "job": "drawer"},
            {"firstName": "George", "lastName": "Bush", "age": "27", "job": "singer"},
            {"firstName": "Thomas", "lastName": "Carter", "age": "23", "job": "programmer"}
        ];

        var keys = ["firstName", "lastName", 'age', 'job']

        var table = new DeviceTableView('hello all', '', keys, employees);

        var img = document.createElement('img');
        img.src = 'http://img.dongqiudi.com/uploads/avatar/2014/10/20/8MCTb0WBFG_thumb_1413805282863.jpg';
        img.id = 'thera_device_panel_qr_view'

        var exTable = new DeviceExTableView(table,img);

        dContainer.appendChild(exTable);

        $(dContainer).draggable();
    }


    show() {
        this.previousWindowClickEvent = window.onclick
        window.onclick = this.dismiss.bind(this)
        this.panel.show()
    }

    dismiss() {
        this.panel.hide()
        window.onclick = this.previousWindowClickEvent
    }
}
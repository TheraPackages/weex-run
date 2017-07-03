'use babel';
'use strict'


window.$ = window.jQuery = require('jquery');
const SimulatorManagerUtil = require('./simulatorManagerUtil')
const WeexRunUtil = require('./weex-run-util')
var prompt = 'All available simulators are shown as below. You can click the action icon to run one simulator. If you want to run or debug' +
    ' on your own cellphone, you can scan the QR code on right side with the preview app which can be downloaded from'

const configurationManager = require('./configurationManager')

import DeviceTableView from './thera-device-table-view';
import DeviceExTableView from './thera-device-ex-table-view';

const PROJECT_TYPE_WEEX = 'weex';
const PROJECT_TYPE_LUAVIEW = 'luaview';
const CMD_LUAVIEW_START_SERVER = 'thera-live-server:debug'


export default class DevicePanelView {
    constructor() {
        configurationManager.getConfig()
            .then((launch) => {
                this.initPanel(launch.type)
            })
    }

    deactivate () {
        if(this.weexRunUtil) {
            this.weexRunUtil.deactivate()
        }
    }


    show() {
        this.previousWindowClickEvent = window.onclick
        window.onclick = this.dismiss.bind(this)
        if(this.panel)  this.panel.show()
        if(this.weexRunUtil) {
            this.weexRunUtil.updateQrCode()
        }
        configurationManager.getConfig()
            .then((launch) => {
                this.initPanel(launch.type)
            })
    }

    dismiss() {
        if(this.panel)  this.panel.hide()
        window.onclick = this.previousWindowClickEvent
    }

    initPanel(projectType) {
        if(this.projectType == projectType && this.panel) return
        if(this.panel) {
            this.panel.hide()
            this.panel.deactivate()
        }

        this.projectType = projectType
        var qrCodeImg
        if(projectType == PROJECT_TYPE_WEEX){
            this.weexRunUtil = new WeexRunUtil();
            qrCodeImg = this.weexRunUtil.qrcode();
            qrCodeImg.id = 'thera_device_panel_qr_view'
        } else if(projectType == PROJECT_TYPE_LUAVIEW) {
             qrCodeImg = null
        }
        this.simulatorManagerUtil = new SimulatorManagerUtil()
        var keys = ['name','type','udid']
        this.deviceTableView = new DeviceTableView();

        this.simulatorManagerUtil.devicesList().then((sims) => {
            var exTable = new DeviceExTableView(this.deviceTableView.createTable(prompt, keys, sims),qrCodeImg);

            exTable.onclick = function () {
                event.cancelBubble = true;
            }

            this.panel = atom.workspace.addModalPanel({
                item: exTable,
                visible: false
            })
            atom.views.getView(this.panel).classList.add('thera-device-modal-panel');
            this.startLuaviewServer()
        }).catch((error)=> {
            var exTable = new DeviceExTableView(this.deviceTableView.createTable(prompt, keys, []),qrCodeImg);
            exTable.onclick = function () {
                event.cancelBubble = true;
            }

            this.panel = atom.workspace.addModalPanel({
                item: exTable,
                visible: false
            })
            atom.views.getView(this.panel).classList.add('thera-device-modal-panel');

            this.startLuaviewServer()
        })
    }

    startLuaviewServer() {
        if(this.projectType == PROJECT_TYPE_LUAVIEW){
            atom.commands.dispatch(atom.views.getView(atom.workspace), CMD_LUAVIEW_START_SERVER)
        }
    }
}
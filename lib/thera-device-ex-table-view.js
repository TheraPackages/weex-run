'use babel';
'use strict'

export default class DeviceExTableView {
    constructor(tableView, qrView) {
        this.tableView = tableView;
        this.qrView = qrView;
        return this.create();
    }

    create() {
        var tbl = document.createElement('table');
        tbl.frame = 'box'
        tbl.rules = 'all'
        tbl.id = 'thera_device_panel_ex_table'
        var tbdy = document.createElement('tbody');

        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(this.tableView)
        tr.appendChild(td)

        var td = document.createElement('td');
        td.appendChild(this.qrView)
        tr.appendChild(td)

        tbdy.appendChild(tr);
        tbl.appendChild(tbdy);
        return tbl;
    }
}
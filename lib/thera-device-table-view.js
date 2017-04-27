'use babel';
'use strict'

var minRowNum = 10;
var titleColor = '#202021';
const SimulatorActionView = require('./simulatorActionView')
var colWidthArray = new Array('23%','20%','47%','3%')

export default class DeviceTableView {
    createTable(prompt, keyArray, jsonArray) {
        this.prompt = prompt;
        this.keyArray = keyArray;
        this.deviceArray = jsonArray;

        var rowNum = this.deviceArray.length;
        var columnNum = this.keyArray.length;

        // 设置 表格style
        var tbl = document.createElement('table');
        tbl.id = 'thera_device_panel_table'

        // 增加title
        var caption = document.createElement("caption");
        caption.innerHTML = "Device Management";
        caption.id = 'thera_device_panel_table_title'
        tbl.appendChild(caption);

        var thead = document.createElement('thead');
        tbl.appendChild(thead)

        //设置第一行：描述栏
        var tr = document.createElement('tr');
        var td = document.createElement('td');

        var str = " thera ";
        var result = str.link('https://github.com/alibaba/Thera/releases');
        td.innerHTML = this.prompt + result +'.'

        var shell = require('electron').shell;
        $(td).on('click', 'a[href^="https://github.com/alibaba/Thera/releases"]', function(event) {
            event.preventDefault();
            shell.openExternal(this.href);
        });

        td.id = 'thera_device_panel_table_prompt'
        td.colSpan = columnNum + 1;
        tr.appendChild(td)
        thead.appendChild(tr);

        var tbdy = document.createElement('tbody');
        tbl.appendChild(tbdy);

        //设置第2行：属性栏
        var tr = document.createElement('tr');
        for (var j = 0; j < columnNum; j++) {
            var td = document.createElement('td');
            td.innerHTML = this.keyArray[j]
            tr.appendChild(td)
        }

        //加上action列属性
        var td = document.createElement('td');
        td.innerHTML = 'action'
        tr.appendChild(td)
        tr.style.background = titleColor
        td.style.paddingBottom = '10px'
        td.style.paddingTop = '10px'
        tbdy.appendChild(tr);

        //填充表格内容
        for (var i = 0; i < rowNum; i++) {
            var tr = document.createElement('tr');
            var json = this.deviceArray[i];

            for (var j = 0; j < columnNum; j++) {
                var value = json[this.keyArray[j]]
                var td = document.createElement('td');
                td.innerHTML = value;
                tr.appendChild(td)
                td.style.width = colWidthArray[j];
            }
            //加上action列属性的值
            var td = document.createElement('td');
            var actionView = new SimulatorActionView(json,tr)
            td.appendChild(actionView);
            tr.appendChild(td)

            tbdy.appendChild(tr);
        }

        for (var i = rowNum; i < minRowNum; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < columnNum + 1; j++) {
                var td = document.createElement('td');
                $(td).html('&nbsp;')
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
        }
        
        return tbl;
    }
}
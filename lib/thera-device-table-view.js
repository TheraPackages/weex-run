'use babel';
'use strict'

var minRowNum = 10;
var titleColor = '#0D3349';
const stopIcon ='https://img.alicdn.com/tfs/TB17ba9QFXXXXa7apXXXXXXXXXX-48-48.png'
const startIcon = 'https://img.alicdn.com/tfs/TB1EWzUQFXXXXaxXXXXXXXXXXXX-48-48.png'

export default class DeviceTableView {
    constructor(prompt, keyArray, jsonArray) {
        this.prompt = prompt;
        this.keyArray = keyArray;
        this.deviceArray = jsonArray;
        return this.createTable();
    }

    createTable() {
        var rowNum = this.deviceArray.length;
        var columnNum = this.keyArray.length;

        // 设置 表格style
        var tbl = document.createElement('table');
        tbl.rules = 'cols'
        tbl.frame = 'box'
        tbl.id = 'thera_device_panel_table'
        var tbdy = document.createElement('tbody');

        // 增加title
        var caption = document.createElement("caption");
        caption.innerHTML = "Divice Management";
        caption.style.textAlign = 'left'
        caption.style.color = 'white'
        caption.style.width = '500px'
        tbl.appendChild(caption);

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
        tbdy.appendChild(tr);

        //设置第2行：属性栏
        var tr = document.createElement('tr');
        tr.style.background = titleColor;
        for (var j = 0; j < columnNum; j++) {
            var td = document.createElement('td');
            td.innerHTML = this.keyArray[j]
            tr.appendChild(td)
        }

        //加上action列属性
        var td = document.createElement('td');
        td.innerHTML = 'action'
        tr.appendChild(td)

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
            }
            //加上action列属性的值
            var td = document.createElement('td');
            var img = document.createElement('img');
            img.className = 'weex_run_stop_icon'
            img.src = startIcon;
            img.isStarted = false;
            img.onclick = function () {
                if(this.isStarted){
                    this.isStarted = false;
                    this.src = startIcon;
                } else {
                    this.isStarted = true;
                    this.src = stopIcon;
                }
            }

            td.appendChild(img);
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

        tbl.appendChild(tbdy);
        return tbl;
    }
}
'use strict'
'use babel'


const {dialog} = require('electron').remote

module.exports = (function () {

    function show (title,msg) {
        dialog.showErrorBox(title.toString(),msg.toString());
    }

    return {
        show:show,
    }

})()
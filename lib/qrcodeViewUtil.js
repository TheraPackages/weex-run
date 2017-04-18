'use babel'
'use strict'

const $ = require('jquery')
const path = require('path')
const qrcode = require('./generateQRCode')

module.exports = class QRCodeViewUtil {
  constructor () {
    this.qrcodePath = path.join(atom.configDirPath, 'storage', 'qr.png')
    
    this.qrImage = document.createElement('img')
    this.qrImage.addClass('weex-run qrcode')
  }

  generateQRCode (content) {
    if (content) {
      return qrcode.generate(content, this.qrcodePath, 200)
    } else {
      return Promise.resolve(this.qrcodePath)
    }
  }

  generateQRImg () {
    return $(this.qrImage).attr('src', this.qrcodePath)
  }
  
}

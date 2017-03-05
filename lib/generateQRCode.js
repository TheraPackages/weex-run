'use babel'
'use strict'

const genQr = require('../vendor/genqr')
const Jimp = require('jimp')

// 将host的ip地址转化为 01 矩阵，并写入图片中. 大小为 size * size
module.exports = (function () {
  var jimp = jimp
  function generate (content, pathToSave, size) {
    return new Promise((resolve, reject) => {
      size = size || 256
      if (content) {
        let matrix = genQr(content)

        let row = matrix.length
        let col = matrix[0].length
        let padding = 2

        jimp = new Jimp(row + 2 * padding, col + 2 * padding, 0xFFFFFFFF, (err, img) => {
          if (err) {
            reject(err)
            console.error(err)
          } else {
            for (let i = 0; i < row; i++) {
              for (let j = 0; j < col; j++) {
                if (matrix[i][j] === 0) {
                  img.setPixelColor(0x000000FF, i + padding, j + padding)
                }
              }
            }
            img.resize(size, size, 'nearestNeighbor')
              .write(pathToSave, (error) => {
                if (error) reject(error)
                else resolve(pathToSave)
              })
          }
        }) // end of jimp
      }
    })
  }

  return {
    generate: generate
  }
})()

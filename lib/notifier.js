'use strict'
'use babel'

module.exports = (function () {
  var atomNotifier
  let packagePath = atom.packages.resolvePackagePath('atom-notifier')
  if (packagePath) atomNotifier = require(packagePath)

  function addSuccess (msg) {
    if (atomNotifier) {
      atomNotifier.send({
        getType: () => 'info',
        getMessage: () => 'success',
        getDetail: () => msg
      })
    } else {
      atom.notifications.addInfo(msg)
    }
  }

  function addInfo (msg) {
    if (atomNotifier) {
      atomNotifier.send({
        getType: () => 'info',
        getMessage: () => 'info',
        getDetail: () => msg
      })
    } else {
      atom.notifications.addInfo(msg)
    }
  }

  function addError (msg) {
    if (atomNotifier) {
      atomNotifier.send({
        getType: () => 'error',
        getMessage: () => 'error',
        getDetail: () => msg
      })
    } else {
      atom.notifications.addError(msg)
    }
  }

  function addWarning (msg) {
    if (atomNotifier) {
      atomNotifier.send({
        getType: () => 'warning',
        getMessage: () => 'warning',
        getDetail: () => msg
      })
    } else {
      atom.notifications.addWarning(msg)
    }
  }

  return {
    addInfo: addInfo,
    addWarning: addWarning,
    addError: addError,
    addSuccess: addSuccess
  }
})()

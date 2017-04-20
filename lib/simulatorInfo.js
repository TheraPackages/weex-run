'use strict'
'use babel'


module.exports = (function () {
    var currentSimulator = null
    var startedSimulatorViewArray = []


    function setCurrentSimulator(simulator) {
        currentSimulator = simulator;
    }

    function getCurrentSimulator() {
        return currentSimulator
    }

    function pushSimulator(simulatorActionView) {
        startedSimulatorViewArray.push(simulatorActionView)
    }

    function popSimulator(simulatorActionView) {
        startedSimulatorViewArray.pop(simulatorActionView);
    }

    function  stopAllSimulator(){
        startedSimulatorViewArray.forEach(function (actionView) {
            actionView.stop()
        })
        startedSimulatorViewArray = []
    }

    function  stopOtherSimulator(simulatorActionView){
        startedSimulatorViewArray.forEach(function (actionView) {
            if(actionView != simulatorActionView) actionView.stop()
        })
        startedSimulatorViewArray = []
    }

    return {
        setCurrentSimulator: setCurrentSimulator,
        getCurrentSimulator: getCurrentSimulator,
        pushSimulator: pushSimulator,
        popSimulator: popSimulator,
        stopAllSimulator:stopAllSimulator,
        stopOtherSimulator:stopOtherSimulator
    }
}())
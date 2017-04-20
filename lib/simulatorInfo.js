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

    function getStartedSimulatorArray() {
        return startedSimulatorViewArray;
    }

    function cleanStartedSimulatorArray() {
        startedSimulatorViewArray = []
    }

    return {
        setCurrentSimulator: setCurrentSimulator,
        getCurrentSimulator: getCurrentSimulator,
        pushSimulator: pushSimulator,
        popSimulator: popSimulator,
        getStartedSimulatorArray:getStartedSimulatorArray,
        cleanStartedSimulatorArray:cleanStartedSimulatorArray
    }
}())
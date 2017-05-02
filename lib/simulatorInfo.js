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

    function pushToStartedSimulator(simulatorActionView) {
        startedSimulatorViewArray.push(simulatorActionView)
    }

    function popFromStartedSimulator(simulatorActionView) {
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
        pushToStartedSimulator: pushToStartedSimulator,
        popFromStartedSimulator: popFromStartedSimulator,
        getStartedSimulatorArray:getStartedSimulatorArray,
        cleanStartedSimulatorArray:cleanStartedSimulatorArray
    }
}())
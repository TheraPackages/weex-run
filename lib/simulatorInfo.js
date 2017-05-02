'use strict'
'use babel'


module.exports = (function () {
    var currentSimulator = null
    var startedSimulatorViewArray = []
    var allSimulatorViewArray = []


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


    function pushToAllSimulator(simulatorActionView) {
        allSimulatorViewArray.push(simulatorActionView)
    }

    function popFromAllSimulator(simulatorActionView) {
        allSimulatorViewArray.pop(simulatorActionView);
    }

    function getAllSimulatorArray() {
        return allSimulatorViewArray;
    }

    function cleanAllSimulatorArray() {
        allSimulatorViewArray = []
    }

    return {
        setCurrentSimulator: setCurrentSimulator,
        getCurrentSimulator: getCurrentSimulator,
        pushToStartedSimulator: pushToStartedSimulator,
        popFromStartedSimulator: popFromStartedSimulator,
        getStartedSimulatorArray:getStartedSimulatorArray,
        cleanStartedSimulatorArray:cleanStartedSimulatorArray,
        pushToAllSimulator:pushToAllSimulator,
        popFromAllSimulator:popFromAllSimulator,
        getAllSimulatorArray:getAllSimulatorArray,
        cleanAllSimulatorArray:cleanAllSimulatorArray
    }
}())
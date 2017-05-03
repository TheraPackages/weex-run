'use strict'
'use babel'


module.exports = (function () {
    var currentSimulator = null
    var startedSimulatorViewArray = new Map()
    var allSimulatorViewArray = new Map()


    function setCurrentSimulator(simulator) {
        currentSimulator = simulator;
    }

    function getCurrentSimulator() {
        return currentSimulator
    }

    function pushToStartedSimulator(simulatorActionView) {
        startedSimulatorViewArray.set(simulatorActionView.udid,simulatorActionView)
    }

    function popFromStartedSimulator(simulatorActionView) {
        startedSimulatorViewArray.delete(simulatorActionView.udid);
    }

    function getStartedSimulatorArray() {
        return startedSimulatorViewArray;
    }

    function cleanStartedSimulatorArray() {
        startedSimulatorViewArray.clear()
    }


    function pushToAllSimulator(simulatorActionView) {
        allSimulatorViewArray.set(simulatorActionView.udid,simulatorActionView)
    }

    function popFromAllSimulator(simulatorActionView) {
        allSimulatorViewArray.delete(simulatorActionView.udid);
    }

    function getAllSimulatorArray() {
        return allSimulatorViewArray;
    }

    function cleanAllSimulatorArray() {
        allSimulatorViewArray.clear()
    }
    
    function getSimulator(udid) {
        return allSimulatorViewArray.get(udid)
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
        cleanAllSimulatorArray:cleanAllSimulatorArray,
        getSimulator:getSimulator
    }
}())
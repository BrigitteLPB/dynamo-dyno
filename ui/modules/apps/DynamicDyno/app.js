class VehicleCurves {
    static PRECISION_FACTOR = 0;
    static MIN_TORQUE = 1;

    engines = [];
    maxRPM = 0;
    enginePriority = 0;
    current = {
        name: "Dyno",
        rpm: 0,
        dashArray: [],
        torque: {
            val: 0,
            max: 0,
            units: UiUnits.torque(0).unit,
            curve: []
        },
        power: {
            val: 0,
            max: 0,
            units: UiUnits.power(0).unit,
            curve: []
        }
    };

    max = {
        name: "Max",
        dashArray: [10, 4],
        torque: {
            val: 0,
            max: 0,
            units: UiUnits.torque(0).unit,
            curve: []
        },
        power: {
            val: 0,
            max: 0,
            units: UiUnits.power(0).unit,
            curve: []
        }
    }


    constructor(vehicleId) {
        this.vehicleId = vehicleId;
    }

    /**
     * make default object with maxRPM
     * @param {*} maxRPM
     * @returns
     */
    static makeDefault(vehicleId, maxRPM) {
        const obj = new VehicleCurves(vehicleId);
        obj.maxRPM = maxRPM;
        // dyno
        obj.current.torque.curve = new Array(Math.floor(maxRPM / (100 - VehicleCurves.PRECISION_FACTOR))).fill(0);
        obj.current.power.curve = new Array(Math.floor(maxRPM / (100 - VehicleCurves.PRECISION_FACTOR))).fill(0);
        // max
        obj.max.torque.curve = new Array(Math.floor(maxRPM / (100 - VehicleCurves.PRECISION_FACTOR))).fill(0);
        obj.max.power.curve = new Array(Math.floor(maxRPM / (100 - VehicleCurves.PRECISION_FACTOR))).fill(0);

        return obj;
    };


    /**
     * return a js object
     * @returns
     */
    getObject() {
        return {
            current: this.current,
            max: this.max,
        }
    }

    /**
     * Add a new engine to the vehicle
     * @param {*} engine
     */
    addEngine(engine) {
        console.debug(JSON.stringify(engine));
        console.debug(engine.priority);

        if (engine.priority < this.enginePriority) {
            return;
        }

        if (engine.priority > this.enginePriority) {
            this.enginePriority = engine.priority;

            // torque
            this.max.torque.max = 0;
            this.max.torque.curve = [];

            // power
            this.max.power.max = 0;
            this.max.power.curve = [];
        }

        for (let e of this.engines) {
            let isEqual = false;
            e.torque.forEach((t, i) => {
                isEqual = t == engine.torque[i];
            });

            if (isEqual) {
                console.debug('already have this engine');
                return;
            }
        }

        this.engines.push(engine);

        // calculate torque
        var max_torque = 0;
        const torque_curve = Array(Math.max(...this.engines.map(engine => engine.torque.length))).fill(0);
        this.engines.map(engine => engine.torque).forEach(list => {
            list.forEach((torque, i) => {
                torque_curve[i] += torque;
                if (torque_curve[i] > max_torque) {
                    max_torque = torque_curve[i]
                }
            });
        });
        this.max.torque.max = max_torque;
        this.max.torque.curve = torque_curve;

        console.debug(`maxTorque: ${max_torque}`);

        // calculate power
        var max_power = 0;
        const power_curve = Array(Math.max(...this.engines.map(engine => engine.power.length))).fill(0);
        this.engines.map(engine => engine.power).forEach(list => {
            list.forEach((power, i) => {
                power_curve[i] += power;
                if (power_curve[i] > max_power) {
                    max_power = power_curve[i]
                }
            });
        });
        this.max.power.max = max_power;
        this.max.power.curve = power_curve;
    }


    /**
     * Set torque and power value for a given RPM
     * @param {double} rpm
     * @param {double} torque
     */
    updateCurrentValues(rpm, torque) {
        const rpmInd = Math.min(Math.floor(rpm), this.maxRPM - 1);
        const power = ((2 * Math.PI * rpm * torque) / 60) / 736;

        // console.debug(`rpm: ${rpm} | torque: ${torque} | power: ${power}`);

        // update runtime vals
        this.current.torque.val = torque;
        this.current.power.val = power;

        this.max.torque.val = this.max.torque.curve[rpmInd];
        this.max.power.val = this.max.power.curve[rpmInd];

        if (torque >= VehicleCurves.MIN_TORQUE) {
            // update current curve data
            const currentIndex = Math.floor(rpmInd / (100 - VehicleCurves.PRECISION_FACTOR));
            this.current.torque.curve[currentIndex] = torque;
            this.current.power.curve[currentIndex] = power;

            // update max value for current curve
            this.current.torque.max = Math.max(this.current.torque.max, torque);
            this.current.power.max = Math.max(this.current.power.max, power);
        }
    }

    resetCurrent() {
        // torque
        this.current.torque.max = 0;
        this.current.torque.curve = new Array(Math.floor(this.maxRPM / (100 - VehicleCurves.PRECISION_FACTOR))).fill(0);
        // power
        this.current.power.max = 0;
        this.current.power.curve = new Array(Math.floor(this.maxRPM / (100 - VehicleCurves.PRECISION_FACTOR))).fill(0);
    }
}

angular.module('beamng.apps')
    .directive('dynamicDyno', ['$log', 'CanvasShortcuts',
        function ($log, CanvasShortcuts) {
            return {
                template: `
                <div
                    style="position: relative; display: flex; flex-direction: column; width: 100%; height: 100%; margin: 0; padding: 0; background-color: whitesmoke;">
                    <div style="position: relative; flex: 1 0 auto;">
                        <canvas style="position: absolute; top: 0; left: 0; margin: 0; padding: 0;"></canvas>
                        <canvas style="position: absolute; top: 0; left: 0; margin: 0; padding: 0;"></canvas>
                        <canvas style="position: absolute; top: 0; left: 0; margin: 0; padding: 0;"></canvas>
                    </div>
                    <div style="display: flex; flex-direction: row; justify-content: space-around; width: 100%; padding: 6px 0;">
                        <div style="display: flex; flex-direction: column; width: 40%; height: inherit;"
                            ng-repeat="(key, obj) in currentData">
                            <h3 style="text-align: center; width: 100%; font-family: monospace; padding: 0; margin: 0;">{{ obj.name }}
                            </h3>
                            <div style="display: flex; flex-direction: row; justify-content: space-between;">
                                <graph-legend-tip type="line" color="black" dash-array="{{ obj.dashArray }}"></graph-legend-tip>
                                <span style="font-family: monospace;">{{::"ui.apps.torquecurve.Torque" | translate}}</span>
                                <span style="font-family: monospace; width: 100%; text-align: center;">{{ obj.torque.val.toFixed(2)
                                    }}/{{ obj.torque.max.toFixed(0)
                                    }}</span>
                                <span style="font-family: monospace;">[{{ obj.torque.units }}]</span>
                            </div>
                            <div style="display: flex; flex-direction: row; justify-content: space-between;">
                                <graph-legend-tip type="line" color="red" dash-array="{{ obj.dashArray }}"></graph-legend-tip>
                                <span style="font-family: monospace;">{{::"ui.apps.torquecurve.Power" | translate}}</span>
                                <span style="font-family: monospace; width: 100%; text-align: center;">{{ obj.power.val.toFixed(2) }}/{{
                                    obj.power.max.toFixed(0)
                                    }}</span>
                                <span style="font-family: monospace;">[{{ obj.power.units }}]</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; justify-content: space-evenly;">
                            <button style="border: none; background: transparent;" ng-click="resetCurrentData()">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                    <path
                                        d="M566.6 9.4c12.5 12.5 12.5 32.8 0 45.3l-192 192 34.7 34.7c4.2 4.2 6.6 10 6.6 16c0 12.5-10.1 22.6-22.6 22.6H364.3L256 211.7V182.6c0-12.5 10.1-22.6 22.6-22.6c6 0 11.8 2.4 16 6.6l34.7 34.7 192-192c12.5-12.5 32.8-12.5 45.3 0zm-344 225.5L341.1 353.4c3.7 42.7-11.7 85.2-42.3 115.8C271.4 496.6 234.2 512 195.5 512L22.1 512C9.9 512 0 502.1 0 489.9c0-6.3 2.7-12.3 7.3-16.5L133.7 359.7c4.2-3.7-.4-10.4-5.4-7.9L77.2 377.4c-6.1 3-13.2-1.4-13.2-8.2c0-31.5 12.5-61.7 34.8-84l8-8c30.6-30.6 73.1-45.9 115.8-42.3zM464 352a80 80 0 1 1 0 160 80 80 0 1 1 0-160z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                `,
                replace: true,
                restrict: 'EA',
                require: '^bngApp',
                controller: ['$scope', function ($scope) {
                    /**
                     * generate a default engine object
                     * @param {*} maxRPM
                     */
                    $scope.precisionFactor = 0;
                    $scope.minTorque = 1;

                    $scope.show_settings = false;

                    $scope.resetCurrentData = function () {
                        $scope.vehicles[$scope.vehicleID].resetCurrent();
                    };

                }],
                link: function (scope, element, attrs) {
                    var streamsList = ['engineInfo'];
                    StreamsManager.add(streamsList);

                    var canvasWrapper = element[0].children[0];
                    var staticCanvas = canvasWrapper.getElementsByTagName('canvas')[0];
                    var max_ctx = staticCanvas.getContext('2d');

                    var dynoCanvas = canvasWrapper.getElementsByTagName('canvas')[1];
                    var dyno_ctx = dynoCanvas.getContext('2d');

                    var dynamicCanvas = canvasWrapper.getElementsByTagName('canvas')[2];
                    var cursor_ctx = dynamicCanvas.getContext('2d');

                    var xFactor = -1;

                    var plotMargins = { top: 15, bottom: 25, left: 25, right: 26 };

                    var _ready = false;

                    scope.engines = [];
                    scope.curves = {};
                    scope.vehicles = {};
                    scope.currentData = {};
                    scope.vehicleID = '';


                    /**
                     * Draw the maximum power and torque curve
                     * @param {VehicleCurves} vehicle the vehicle object
                     */
                    function plotStaticGraphs(vehicle) {
                        xFactor = (dynamicCanvas.width - plotMargins.left - plotMargins.right) / vehicle.maxRPM;

                        max_ctx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);

                        const maxPower = Math.ceil(vehicle.max.power.max / 250) * 250;
                        const maxTorque = Math.ceil(vehicle.max.torque.max / 250) * 250;
                        var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1));
                        var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1));
                        var rpmTicks = Array(Math.floor(vehicle.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000);

                        CanvasShortcuts.plotAxis(max_ctx, 'left', [0, maxTorque], torqueTicks, plotMargins, { numLines: torqueTicks.length, color: 'darkgrey', dashArray: [2, 3] }, 'black');
                        CanvasShortcuts.plotAxis(max_ctx, 'right', [0, maxPower], powerTicks, plotMargins, null, 'red');
                        CanvasShortcuts.plotAxis(max_ctx, 'top', [0, vehicle.maxRPM], [], plotMargins, null);
                        CanvasShortcuts.plotAxis(max_ctx, 'bottom', [0, vehicle.maxRPM], rpmTicks, plotMargins, { values: rpmTicks, color: 'darkgrey', dashArray: [2, 3] }, 'black');

                        // draw static curve
                        CanvasShortcuts.plotData(max_ctx, vehicle.max.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: plotMargins, lineWidth: 2, lineColor: 'black', dashArray: vehicle.max.dashArray });
                        CanvasShortcuts.plotData(max_ctx, vehicle.max.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: plotMargins, lineWidth: 2, lineColor: 'red', dashArray: vehicle.max.dashArray });
                    }


                    /**
                     * Draw the current power and torque curve
                     * @param {VehicleCurves} vehicle the vehicle object
                     */
                    function plotDynamicGraphs(vehicle) {
                        dyno_ctx.clearRect(0, 0, dynoCanvas.width, dynoCanvas.height);

                        const maxPower = Math.ceil(vehicle.max.power.max / 250) * 250;
                        const maxTorque = Math.ceil(vehicle.max.torque.max / 250) * 250;
                        var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1));
                        var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1));
                        var rpmTicks = Array(Math.floor(vehicle.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000);

                        CanvasShortcuts.plotAxis(dyno_ctx, 'left', [0, maxTorque], torqueTicks, plotMargins, null);
                        CanvasShortcuts.plotAxis(dyno_ctx, 'right', [0, maxPower], powerTicks, plotMargins, null);
                        CanvasShortcuts.plotAxis(dyno_ctx, 'top', [0, vehicle.maxRPM / (100 - VehicleCurves.PRECISION_FACTOR)], [], plotMargins, null);
                        CanvasShortcuts.plotAxis(dyno_ctx, 'bottom', [0, vehicle.maxRPM / (100 - VehicleCurves.PRECISION_FACTOR)], rpmTicks, plotMargins, null);

                        // draw dynamic curve
                        CanvasShortcuts.plotData(dyno_ctx, vehicle.current.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: plotMargins, lineWidth: 2, lineColor: 'black', dashArray: vehicle.current.dashArray });
                        CanvasShortcuts.plotData(dyno_ctx, vehicle.current.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: plotMargins, lineWidth: 2, lineColor: 'red', dashArray: vehicle.current.dashArray });
                    }


                    /**
                     * draw an orange cursor on the graph
                     * @param {*} rpm
                     * @param {VehicleCurves} vehicle the vehicle object
                     * @returns
                     */
                    function drawCursor(rpm, vehicle) {
                        cursor_ctx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);

                        if (rpm >= vehicle.maxRPM) { return; }

                        var rpmX = plotMargins.left + Math.floor(rpm * xFactor);

                        // RPM indicator
                        cursor_ctx.beginPath();
                        cursor_ctx.moveTo(rpmX, plotMargins.top);
                        cursor_ctx.lineTo(rpmX, dynamicCanvas.height - plotMargins.bottom);

                        cursor_ctx.lineWidth = 2;
                        cursor_ctx.strokeStyle = 'orange';
                        cursor_ctx.shadowBlur = 30;
                        cursor_ctx.shadowColor = 'steelblue';
                        cursor_ctx.stroke();
                    }


                    // Streams
                    scope.$on('$destroy', function () {
                        StreamsManager.remove(streamsList);
                    })


                    scope.$on('VehicleChange', () => {
                        delete scope.vehicles[scope.vehicleID]; // remove vehicle data
                        scope.currentData = {};
                        scope.vehicleID = '';
                    })


                    scope.$on('TorqueCurveChanged', function (_, data) {
                        if (scope.vehicleID !== data.vehicleID) {
                            console.log(`got a new vehicle, id : ${data.vehicleID}`);
                            scope.vehicleID = data.vehicleID;

                            if (!(data.vehicleID in scope.vehicles)) {
                                scope.vehicles[data.vehicleID] = VehicleCurves.makeDefault(data.vehicleID, data.maxRPM)
                            }
                        }

                        if (scope.vehicleID in scope.vehicles) {
                            console.debug(`add a new engine for vehicle ${scope.vehicleID}`)
                            for (let engine of data.curves) {
                                scope.vehicles[data.vehicleID].addEngine(engine);
                            }

                            scope.currentData = scope.vehicles[scope.vehicleID].getObject();
                            plotStaticGraphs(scope.vehicles[scope.vehicleID]);
                        }
                    });


                    scope.graph = function () {
                        plotStaticGraphs(scope.vehicles[scope.vehicleID])
                    }


                    scope.$on('streamsUpdate', function (event, streams) {
                        if (streams.engineInfo != undefined && scope.vehicleID != '') {
                            const ENGINE_RPM_INDEX = 4;
                            const ENGINE_TORQUE_INDEX = 8;

                            const _rpm = streams.engineInfo[ENGINE_RPM_INDEX] <= scope.vehicles[scope.vehicleID].maxRPM ? streams.engineInfo[ENGINE_RPM_INDEX] : scope.vehicles[scope.vehicleID].maxRPM;
                            const torque = streams.engineInfo[ENGINE_TORQUE_INDEX] >= 0 ? streams.engineInfo[ENGINE_TORQUE_INDEX] : 0;

                            scope.vehicles[scope.vehicleID].updateCurrentValues(_rpm, torque);
                            scope.currentData = scope.vehicles[scope.vehicleID].getObject();

                            plotDynamicGraphs(scope.vehicles[scope.vehicleID]);
                            drawCursor(_rpm, scope.vehicles[scope.vehicleID]);
                        }
                    });

                    scope.$on('VehicleFocusChanged', function () {
                        bngApi.activeObjectLua('controller.mainController.sendTorqueData()');
                    })

                    scope.$on('app:resized', function (event, data) {
                        // We can use this event as initialization trigger since it is emitted from
                        // the app-container for this reason
                        staticCanvas.width = canvasWrapper.offsetWidth;
                        staticCanvas.height = canvasWrapper.offsetHeight;

                        dynoCanvas.width = canvasWrapper.offsetWidth;
                        dynoCanvas.height = canvasWrapper.offsetHeight;

                        dynamicCanvas.width = canvasWrapper.offsetWidth;
                        dynamicCanvas.height = canvasWrapper.offsetHeight;

                        if (!_ready) {
                            _ready = true;
                            bngApi.activeObjectLua('controller.mainController.sendTorqueData()');
                        } else {
                            plotStaticGraphs(scope.vehicleID[scope.vehicleID]);
                        }
                    })
                }
            }
        }
    ]
    )

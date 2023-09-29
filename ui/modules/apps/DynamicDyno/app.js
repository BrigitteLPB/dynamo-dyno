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
                                ng-repeat="(key, obj) in engines">
                                <h3 style="text-align: center; width: 100%; font-family: monospace; padding: 0; margin: 0;">{{ obj.name }}
                                </h3>
                                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                                    <graph-legend-tip type="line" color="black" dash-array="{{ obj.dashArray }}"></graph-legend-tip>
                                    <span style="font-family: monospace;">{{::"ui.apps.torquecurve.Torque" | translate}}</span>
                                    <span style="font-family: monospace; width: 100%; text-align: center;">{{ obj.torque.val.toFixed(2)
                                        }}/{{ obj.torque.max.toFixed(0)
                                        }}</span>
                                    <span style="font-family: monospace;">[{{ obj.power.units }}]</span>
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
                                <button style="border: none; background: transparent;" ng-click="/*displaySettings(true);*/">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                        <path
                                            d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                                    </svg>
                                </button>
                                <button style="border: none; background: transparent;" ng-click="resetCurrentData()">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                        <path
                                            d="M566.6 9.4c12.5 12.5 12.5 32.8 0 45.3l-192 192 34.7 34.7c4.2 4.2 6.6 10 6.6 16c0 12.5-10.1 22.6-22.6 22.6H364.3L256 211.7V182.6c0-12.5 10.1-22.6 22.6-22.6c6 0 11.8 2.4 16 6.6l34.7 34.7 192-192c12.5-12.5 32.8-12.5 45.3 0zm-344 225.5L341.1 353.4c3.7 42.7-11.7 85.2-42.3 115.8C271.4 496.6 234.2 512 195.5 512L22.1 512C9.9 512 0 502.1 0 489.9c0-6.3 2.7-12.3 7.3-16.5L133.7 359.7c4.2-3.7-.4-10.4-5.4-7.9L77.2 377.4c-6.1 3-13.2-1.4-13.2-8.2c0-31.5 12.5-61.7 34.8-84l8-8c30.6-30.6 73.1-45.9 115.8-42.3zM464 352a80 80 0 1 1 0 160 80 80 0 1 1 0-160z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div
                            style="position: absolute; top: 0; width: 0; width: 100%; height: 100%; z-index: 1; background-color: whitesmoke; display: {{show_settings ? 'visible' : 'none'}};">
                            <button style="border: none; background: transparent;" ng-click="displaySettings(false);">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                    <path
                                        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
                                </svg>
                            </button>
                            <md-slider min=0 max=100 ng-model="precisionFactor" step="1"></md-slider>
                            <md-slider min=0 max=100 ng-model="minTorque" step="0.5"></md-slider>
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

                    $scope.displaySettings = function (state){
                        $scope.show_settings = state;
                    }

                    $scope.resetCurrentData = function () {
                        $scope.engines.current.torque.curve = new Array(Math.floor($scope.engines.current.maxRPM / (100-$scope.precisionFactor))).fill(0)
                        $scope.engines.current.power.curve = new Array(Math.floor($scope.engines.current.maxRPM / (100-$scope.precisionFactor))).fill(0)
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

                    scope.engines = {};
                    scope.vehicleID = '';

                    // Functions
                    /**
                     * create a default Engine object with torque and power data
                     * @param {*} maxRPM
                     */
                    function generateDefaultEngineObject(maxRPM) {
                        return {
                            current: {
                                name: "Dyno",
                                maxRPM: maxRPM,
                                rpm: 0,
                                dashArray: [],
                                torque: {
                                    val: 0,
                                    max: 0,
                                    units: UiUnits.torque(0).unit,
                                    curve: new Array(Math.floor(maxRPM / (100-scope.precisionFactor))).fill(0)
                                },
                                power: {
                                    val: 0,
                                    max: 0,
                                    units: UiUnits.power(0).unit,
                                    curve: new Array(Math.floor(maxRPM / (100-scope.precisionFactor))).fill(0)
                                }
                            },
                            max: {
                                name: "Max",
                                maxRPM: maxRPM,
                                dashArray: [10, 4],
                                engineNames: [],
                                priority: 0,
                                torque: {
                                    val: 0,
                                    max: 0,
                                    units: UiUnits.torque(0).unit,
                                    curve: new Array(maxRPM).fill(0)
                                },
                                power: {
                                    val: 0,
                                    max: 0,
                                    units: UiUnits.power(0).unit,
                                    curve: new Array(maxRPM).fill(0)
                                }
                            }
                        }
                    };


                    /**
                     * Draw the maximum power and torque curve
                     */
                    function plotStaticGraphs() {
                        xFactor = (dynamicCanvas.width - plotMargins.left - plotMargins.right) / scope.engines.max.maxRPM;

                        max_ctx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);

                        const maxPower = Math.ceil(scope.engines.max.power.max / 250) * 250;
                        const maxTorque = Math.ceil(scope.engines.max.torque.max / 250) * 250;
                        var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1));
                        var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1));
                        var rpmTicks = Array(Math.floor(scope.engines.max.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000);

                        CanvasShortcuts.plotAxis(max_ctx, 'left', [0, maxTorque], torqueTicks, plotMargins, { numLines: torqueTicks.length, color: 'darkgrey', dashArray: [2, 3] }, 'black');
                        CanvasShortcuts.plotAxis(max_ctx, 'right', [0, maxPower], powerTicks, plotMargins, null, 'red');
                        CanvasShortcuts.plotAxis(max_ctx, 'top', [0, scope.engines.max.maxRPM], [], plotMargins, null);
                        CanvasShortcuts.plotAxis(max_ctx, 'bottom', [0, scope.engines.max.maxRPM], rpmTicks, plotMargins, { values: rpmTicks, color: 'darkgrey', dashArray: [2, 3] }, 'black');

                        // draw static curve
                        CanvasShortcuts.plotData(max_ctx, scope.engines.max.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: plotMargins, lineWidth: 2, lineColor: 'black', dashArray: scope.engines.max.dashArray });
                        CanvasShortcuts.plotData(max_ctx, scope.engines.max.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: plotMargins, lineWidth: 2, lineColor: 'red', dashArray: scope.engines.max.dashArray });
                    }


                    /**
                     * Draw the current power and torque curve
                     */
                    function plotDynamicGraphs() {
                        dyno_ctx.clearRect(0, 0, dynoCanvas.width, dynoCanvas.height);

                        const maxPower = Math.ceil(scope.engines.max.power.max / 250) * 250;
                        const maxTorque = Math.ceil(scope.engines.max.torque.max / 250) * 250;
                        var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1));
                        var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1));
                        var rpmTicks = Array(Math.floor(scope.engines.max.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000);

                        CanvasShortcuts.plotAxis(dyno_ctx, 'left', [0, maxTorque], torqueTicks, plotMargins, null);
                        CanvasShortcuts.plotAxis(dyno_ctx, 'right', [0, maxPower], powerTicks, plotMargins, null);
                        CanvasShortcuts.plotAxis(dyno_ctx, 'top', [0, scope.engines.max.maxRPM / (100-scope.precisionFactor)], [], plotMargins, null);
                        CanvasShortcuts.plotAxis(dyno_ctx, 'bottom', [0, scope.engines.max.maxRPM / (100-scope.precisionFactor)], rpmTicks, plotMargins, null);

                        // draw dynamic curve
                        CanvasShortcuts.plotData(dyno_ctx, scope.engines.current.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: plotMargins, lineWidth: 2, lineColor: 'black', dashArray: [] });
                        CanvasShortcuts.plotData(dyno_ctx, scope.engines.current.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: plotMargins, lineWidth: 2, lineColor: 'red', dashArray: [] });
                    }


                    /**
                     * draw an orange cursor on the graph
                     * @param {*} rpm
                     * @returns
                     */
                    function drawCursor(rpm) {
                        cursor_ctx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);

                        if (rpm >= scope.engines.max.maxRPM) { return; }

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
                        scope.vehicleID = '';
                    })


                    scope.$on('TorqueCurveChanged', function (_, data) {
                        if (scope.vehicleID !== data.vehicleID) {
                            console.log("got a new vehicle"); // DEBUG
                            // reset all torques curves
                            scope.vehicleID = data.vehicleID;
                            scope.engines = generateDefaultEngineObject(data.maxRPM);
                        }

                        if (!scope.engines.max.engineNames.find(engineNames => engineNames === data.deviceName)) {
                            // creating a new dynamic engine
                            const maxPriority = Math.max(...data.curves.map(e => e.priority));
                            const maxPriorityCurve = data.curves.find(element => element.priority == maxPriority);

                            if (scope.engines.max.priority < maxPriority) {
                                scope.engines.max.priority = maxPriority;

                                // updating max curves
                                scope.engines.max.torque.max = Math.max.apply(Math, maxPriorityCurve.torque);
                                scope.engines.max.torque.curve = maxPriorityCurve.torque.map(val => Math.max(val, 0));
                                scope.engines.max.power.max = Math.max.apply(Math, maxPriorityCurve.power);
                                scope.engines.max.power.curve = maxPriorityCurve.power.map(val => Math.max(val, 0));

                                scope.engines.max.engineNames.push(data.deviceName);
                            }

                            plotStaticGraphs();
                        }
                    });


                    scope.graph = function () {
                        plotStaticGraphs()
                    }


                    scope.$on('streamsUpdate', function (event, streams) {
                        if (streams.engineInfo != undefined && scope.engines.max != undefined && scope.engines.current != undefined) {
                            const ENGINE_RPM_INDEX = 4;
                            const ENGINE_TORQUE_INDEX = 8;

                            const _rpm = streams.engineInfo[ENGINE_RPM_INDEX] <= scope.engines.max.maxRPM ? streams.engineInfo[ENGINE_RPM_INDEX] : scope.engines.max.maxRPM;
                            const rpmInd = Math.min(Math.floor(_rpm), scope.engines.current.maxRPM - 1);

                            // update dynamic dyno data for this RPM
                            const torque = streams.engineInfo[ENGINE_TORQUE_INDEX] >= 0 ? streams.engineInfo[ENGINE_TORQUE_INDEX] : 0;
                            const power = ((2 * Math.PI * _rpm * torque) / 60) / 736;

                            // update runtime vals
                            scope.engines.current.torque.val = torque;
                            scope.engines.current.power.val = power;

                            scope.engines.max.torque.val = scope.engines.max.torque.curve[rpmInd];
                            scope.engines.max.power.val = scope.engines.max.power.curve[rpmInd];

                            if (torque >= scope.minTorque) {
                                // update current curve data
                                scope.engines.current.torque.curve[Math.floor(rpmInd / (100-scope.precisionFactor))] = torque;
                                scope.engines.current.power.curve[Math.floor(rpmInd / (100-scope.precisionFactor))] = power;

                                // update max value for current curve
                                scope.engines.current.torque.max = Math.max(scope.engines.current.torque.max, torque);
                                scope.engines.current.power.max = Math.max(scope.engines.current.power.max, power);

                            }


                            // plotStaticGraphs();
                            drawCursor(_rpm);
                            plotDynamicGraphs();
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
                            plotStaticGraphs();
                        }
                    })
                }
            }
        }])

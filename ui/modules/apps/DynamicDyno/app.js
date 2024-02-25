
angular.module('beamng.apps')
    .directive('dynamicDyno', ['$log', 'CanvasShortcuts',
        function ($log, CanvasShortcuts) {
            class DrawBoard {
                static PLOT_MARGINS = { top: 15, bottom: 12, left: 25, right: 26 };
                static INTERVAL_VALUE = 50;

                constructor(element, CanvasShortcuts) {
                    this.CanvasShortcuts = CanvasShortcuts;
                    this.canvasWrapper = element[0].querySelector("#canva-container");
                    this.uiCanvas = this.canvasWrapper.getElementsByTagName('canvas')[0];
                    this.ui_ctx = this.uiCanvas.getContext('2d');

                    this.staticCanvas = this.canvasWrapper.getElementsByTagName('canvas')[1];
                    this.max_ctx = this.staticCanvas.getContext('2d');

                    this.dynoCanvas = this.canvasWrapper.getElementsByTagName('canvas')[2];
                    this.dyno_ctx = this.dynoCanvas.getContext('2d');

                    this.dynamicCanvas = this.canvasWrapper.getElementsByTagName('canvas')[3];
                    this.cursor_ctx = this.dynamicCanvas.getContext('2d');

                    this.intervalCapturingValue = 50;
                    this.isStaticCurveHide = false;
                    this.isSettingsDisplayed = false;
                    this.xFactor = -1;
                }

                /**
                 * Draw the ui (axis and grid) of the vehicle
                 * @param {*} vehicle
                 */
                plotStaticUi(vehicle, useBlackTheme = false) {
                    this.xFactor = (this.dynamicCanvas.width - DrawBoard.PLOT_MARGINS.left - DrawBoard.PLOT_MARGINS.right) / vehicle.maxRPM;

                    this.ui_ctx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

                    const maxTorque = Math.ceil(vehicle.max.torque.max / DrawBoard.INTERVAL_VALUE) * DrawBoard.INTERVAL_VALUE;
                    const maxPower = Math.ceil(vehicle.max.power.max / DrawBoard.INTERVAL_VALUE) * DrawBoard.INTERVAL_VALUE;
                    var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1));
                    var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1));
                    var rpmTicks = Array(Math.floor(vehicle.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000);

                    this.CanvasShortcuts.plotAxis(this.ui_ctx, 'left', [0, maxTorque], torqueTicks, DrawBoard.PLOT_MARGINS, { numLines: torqueTicks.length, color: useBlackTheme? 'lightgrey' : 'var(--dark-neutral-grey)', dashArray: [2, 3] }, useBlackTheme? 'white' : 'black');
                    this.CanvasShortcuts.plotAxis(this.ui_ctx, 'right', [0, maxPower], powerTicks, DrawBoard.PLOT_MARGINS, null, 'red');
                    this.CanvasShortcuts.plotAxis(this.ui_ctx, 'top', [0, vehicle.maxRPM], [], DrawBoard.PLOT_MARGINS, null);
                    this.CanvasShortcuts.plotAxis(this.ui_ctx, 'bottom', [0, vehicle.maxRPM], rpmTicks, DrawBoard.PLOT_MARGINS, { values: rpmTicks, color: useBlackTheme? 'lightgrey' : 'var(--dark-neutral-grey)', dashArray: [2, 3] }, useBlackTheme? 'white' : 'black');

                    this.CanvasShortcuts.plotData(this.ui_ctx, new Array(vehicle.max.torque.curve.length).fill(0), 0, maxTorque, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 0 });
                    this.CanvasShortcuts.plotData(this.ui_ctx, new Array(vehicle.max.power.curve.length).fill(0), 0, maxPower, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 0 });
                }

                /**
                 * Draw the maximum power and torque curve
                 * @param {VehicleCurves} vehicle the vehicle object
                 */
                plotStaticGraphs(vehicle, useBlackTheme = false) {
                    this.plotStaticUi(vehicle, useBlackTheme);
                    if (this.isStaticCurveHide) {
                        return;
                    }

                    this.max_ctx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

                    const maxTorque = Math.ceil(vehicle.max.torque.max / DrawBoard.INTERVAL_VALUE) * DrawBoard.INTERVAL_VALUE;
                    const maxPower = Math.ceil(vehicle.max.power.max / DrawBoard.INTERVAL_VALUE) * DrawBoard.INTERVAL_VALUE;

                    // draw static curve
                    this.CanvasShortcuts.plotData(this.max_ctx, vehicle.max.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: useBlackTheme? 'white' : 'black', dashArray: vehicle.max.dashArray });
                    this.CanvasShortcuts.plotData(this.max_ctx, vehicle.max.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: 'red', dashArray: vehicle.max.dashArray });
                }


                /**
                 * Draw the current power and torque curve
                 * @param {VehicleCurves} vehicle the vehicle object
                 */
                plotDynamicGraphs(vehicle, useBlackTheme = false) {
                    this.dyno_ctx.clearRect(0, 0, this.dynoCanvas.width, this.dynoCanvas.height);

                    const maxTorque = Math.ceil(vehicle.max.torque.max / DrawBoard.INTERVAL_VALUE) * DrawBoard.INTERVAL_VALUE;
                    const maxPower = Math.ceil(vehicle.max.power.max / DrawBoard.INTERVAL_VALUE) * DrawBoard.INTERVAL_VALUE;

                    // draw dynamic curve
                    this.CanvasShortcuts.plotData(this.dyno_ctx, vehicle.current.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: useBlackTheme? 'white' : 'black', dashArray: vehicle.current.dashArray });
                    this.CanvasShortcuts.plotData(this.dyno_ctx, vehicle.current.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: 'red', dashArray: vehicle.current.dashArray });
                }


                /**
                 * draw an orange cursor on the graph
                 * @param {*} rpm
                 * @param {VehicleCurves} vehicle the vehicle object
                 * @returns
                 */
                drawCursor(rpm, vehicle) {
                    this.cursor_ctx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);

                    if (rpm >= vehicle.maxRPM) { return; }

                    var rpmX = DrawBoard.PLOT_MARGINS.left + Math.floor(rpm * this.xFactor);

                    // RPM indicator
                    this.cursor_ctx.beginPath();
                    this.cursor_ctx.moveTo(rpmX, DrawBoard.PLOT_MARGINS.top);
                    this.cursor_ctx.lineTo(rpmX, this.dynamicCanvas.height - DrawBoard.PLOT_MARGINS.bottom);

                    this.cursor_ctx.lineWidth = 2;
                    this.cursor_ctx.strokeStyle = 'orange';
                    this.cursor_ctx.shadowBlur = 30;
                    this.cursor_ctx.shadowColor = 'steelblue';
                    this.cursor_ctx.stroke();
                }

                resize() {
                    this.uiCanvas.width = this.canvasWrapper.offsetWidth;
                    this.uiCanvas.height = this.canvasWrapper.offsetHeight;

                    this.staticCanvas.width = this.canvasWrapper.offsetWidth;
                    this.staticCanvas.height = this.canvasWrapper.offsetHeight;

                    this.dynoCanvas.width = this.canvasWrapper.offsetWidth;
                    this.dynoCanvas.height = this.canvasWrapper.offsetHeight;

                    this.dynamicCanvas.width = this.canvasWrapper.offsetWidth;
                    this.dynamicCanvas.height = this.canvasWrapper.offsetHeight;
                }

                hideStaticCurve() {
                    this.isStaticCurveHide = !this.isStaticCurveHide;
                    this.max_ctx.canvas.hidden = this.isStaticCurveHide;
                }

                toggleSettings(state) {
                    this.isSettingsDisplayed = state;
                }
            }

            class VehicleCurves {
                static PRECISION_FACTOR = 50;
                static TORQUE_THRESHOLD = 1;

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
                    obj.current.torque.curve = new Array(Math.floor(maxRPM / VehicleCurves.PRECISION_FACTOR)).fill(0);
                    obj.current.power.curve = new Array(Math.floor(maxRPM / VehicleCurves.PRECISION_FACTOR)).fill(0);
                    // max
                    obj.max.torque.curve = new Array(Math.floor(maxRPM / VehicleCurves.PRECISION_FACTOR)).fill(0);
                    obj.max.power.curve = new Array(Math.floor(maxRPM / VehicleCurves.PRECISION_FACTOR)).fill(0);

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
                    this.max.torque.max = UiUnits.torque(max_torque).val;
                    this.max.torque.curve = torque_curve;

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
                    this.max.power.max = UiUnits.power(max_power).val;
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

                    // update runtime vals
                    this.current.torque.val = UiUnits.torque(torque).val;
                    this.current.power.val = UiUnits.power(power).val;

                    this.max.torque.val = UiUnits.torque(this.max.torque.curve[rpmInd]).val;
                    this.max.power.val = UiUnits.power(this.max.power.curve[rpmInd]).val;

                    if (torque >= VehicleCurves.TORQUE_THRESHOLD) {
                        // update current curve data
                        const currentIndex = Math.floor(rpmInd / VehicleCurves.PRECISION_FACTOR);
                        this.current.torque.curve[currentIndex] = torque;
                        this.current.power.curve[currentIndex] = power;

                        // update max value for current curve
                        this.current.torque.max = UiUnits.torque(Math.max(this.current.torque.max, torque)).val
                        this.current.power.max = UiUnits.torque(Math.max(this.current.power.max, power)).val;
                    }
                }

                resetCurrent() {
                    // torque
                    this.current.torque.max = 0;
                    this.current.torque.curve = new Array(Math.floor(this.maxRPM / VehicleCurves.PRECISION_FACTOR)).fill(0);
                    // power
                    this.current.power.max = 0;
                    this.current.power.curve = new Array(Math.floor(this.maxRPM / VehicleCurves.PRECISION_FACTOR)).fill(0);
                }


                updateCurveWithNewPrecisionFactor() {
                    const newDefaultCurve = VehicleCurves.makeDefault(this.vehicleId, this.maxRPM);
                    this.current = newDefaultCurve.current;
                }
            }

            return {
                templateUrl: '/ui/modules/apps/DynamicDyno/app.html',
                replace: true,
                restrict: 'EA',
                require: '^bngApp',
                controller: ['$scope', function ($scope) {
                    $scope.precisionFactor = 50;
                    $scope.torqueThreshold = 1;
                    $scope.useBlackTheme = false;
                    $scope.isMaxCuveHide = false;

                    $scope.resetCurrentData = function () {
                        $scope.vehicles[$scope.vehicleID].resetCurrent();
                    };

                    $scope.hideStaticCurve = () => { $scope.drawBoard.hideStaticCurve(); }

                    $scope.showSettings = () => { $scope.drawBoard.toggleSettings(true) }
                    $scope.hideSettings = () => { $scope.drawBoard.toggleSettings(false) }
                }],
                link: function (scope, element, attrs) {
                    var _ready = false;
                    var streamsList = ['engineInfo'];
                    StreamsManager.add(streamsList);

                    scope.drawBoard = new DrawBoard(element, CanvasShortcuts);

                    scope.engines = [];
                    scope.curves = {};
                    scope.vehicles = {};
                    scope.currentData = {};
                    scope.vehicleID = '';

                    // var watch
                    scope.$watch('precisionFactor', (newValue, oldValue) => {
                        if (newValue !== undefined && newValue != oldValue) {
                            bngApi.engineLua(`settings.setValue("precisionFactor",${newValue})`);
                            VehicleCurves.PRECISION_FACTOR = Math.max(newValue, 1);
                            // update the actual curve with the new precision factor
                            if (scope.vehicles[scope.vehicleID]){
                                scope.vehicles[scope.vehicleID].updateCurveWithNewPrecisionFactor();
                            }
                        }
                    });

                    scope.$watch('torqueThreshold', (newValue, oldValue) => {
                        if (newValue !== undefined && newValue != oldValue) {
                            bngApi.engineLua(`settings.setValue("torqueThreshold",${newValue})`);
                            VehicleCurves.TORQUE_THRESHOLD = newValue;
                        }
                    });

                    scope.$watch('useBlackTheme', (newValue, oldValue) => {
                        if (newValue !== undefined && newValue != oldValue) {
                            bngApi.engineLua(`settings.setValue("useBlackTheme",${newValue})`);
                            if (newValue) {
                                element[0].classList.add('black-theme');
                            } else {
                                element[0].classList.remove('black-theme');
                            }
                            scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID], scope.useBlackTheme)
                        }
                    });

                    // load actual settings
                    bngApi.engineLua('settings.getValue("precisionFactor", 0)', function (data) {
                        scope.$evalAsync(function () {
                            scope.precisionFactor = data;
                        });
                    });

                    bngApi.engineLua('settings.getValue("torqueThreshold", 1)', function (data) {
                        scope.$evalAsync(function () {
                            scope.torqueThreshold = data;
                        });
                    });

                    bngApi.engineLua('settings.getValue("useBlackTheme", false)', function (data) {
                        scope.$evalAsync(function () {
                            scope.useBlackTheme = data;
                        });
                    });

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
                            scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID], scope.useBlackTheme);
                        }
                    });


                    scope.graph = function () {
                        scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID], scope.useBlackTheme)
                    }


                    scope.$on('streamsUpdate', function (event, streams) {
                        if (streams.engineInfo != undefined && scope.vehicleID != '') {
                            const ENGINE_RPM_INDEX = 4;
                            const ENGINE_TORQUE_INDEX = 8;

                            const _rpm = Math.min(streams.engineInfo[ENGINE_RPM_INDEX], scope.vehicles[scope.vehicleID].maxRPM);
                            const torque = streams.engineInfo[ENGINE_TORQUE_INDEX] >= 0 ? streams.engineInfo[ENGINE_TORQUE_INDEX] : 0;

                            scope.vehicles[scope.vehicleID].updateCurrentValues(_rpm, torque);
                            scope.currentData = scope.vehicles[scope.vehicleID].getObject();

                            scope.drawBoard.plotDynamicGraphs(scope.vehicles[scope.vehicleID], scope.useBlackTheme);
                            scope.drawBoard.drawCursor(_rpm, scope.vehicles[scope.vehicleID]);
                        }
                    });

                    scope.$on('VehicleFocusChanged', function () {
                        bngApi.activeObjectLua('controller.mainController.sendTorqueData()');
                    })

                    scope.$on('app:resized', function (event, data) {
                        // We can use this event as initialization trigger since it is emitted from
                        // the app-container for this reason
                        scope.drawBoard.resize();

                        if (!_ready) {
                            _ready = true;
                            bngApi.activeObjectLua('controller.mainController.sendTorqueData()');
                        } else {
                            scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID], scope.useBlackTheme);
                        }
                    })
                }
            }
        }
    ]
    )

class DrawBoard {
    static PLOT_MARGINS = { top: 15, bottom: 25, left: 25, right: 26 };
    static VALUE_INTERVAL = 50

    constructor(element, CanvasShortcuts) {
        this.CanvasShortcuts = CanvasShortcuts;
        this.canvasWrapper = element[0].children[0];

        this.uiCanvas = this.canvasWrapper.getElementsByTagName('canvas')[0];
        this.ui_ctx = this.uiCanvas.getContext('2d');

        this.staticCanvas = this.canvasWrapper.getElementsByTagName('canvas')[1];
        this.max_ctx = this.staticCanvas.getContext('2d');

        this.dynoCanvas = this.canvasWrapper.getElementsByTagName('canvas')[2];
        this.dyno_ctx = this.dynoCanvas.getContext('2d');

        this.dynamicCanvas = this.canvasWrapper.getElementsByTagName('canvas')[3];
        this.cursor_ctx = this.dynamicCanvas.getContext('2d');

        this.isStaticCurveHide = false;
        this.xFactor = -1;

        console.info(this.staticCanvas);
        console.info(this.dynoCanvas);
        console.info(this.dynamicCanvas);
    }

    /**
     * Draw the ui (axis and grid) of the vehicle
     * @param {*} vehicle
     */
    plotStaticUi(vehicle){
        this.xFactor = (this.dynamicCanvas.width - DrawBoard.PLOT_MARGINS.left - DrawBoard.PLOT_MARGINS.right) / vehicle.maxRPM;

        this.ui_ctx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

        const maxTorque = Math.ceil(vehicle.max.torque.max / DrawBoard.VALUE_INTERVAL) * DrawBoard.VALUE_INTERVAL;
        const maxPower = Math.ceil(vehicle.max.power.max / DrawBoard.VALUE_INTERVAL) * DrawBoard.VALUE_INTERVAL;
        var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1));
        var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1));
        var rpmTicks = Array(Math.floor(vehicle.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000);

        this.CanvasShortcuts.plotAxis(this.ui_ctx, 'left', [0, maxTorque], torqueTicks, DrawBoard.PLOT_MARGINS, { numLines: torqueTicks.length, color: 'darkgrey', dashArray: [2, 3] }, 'black');
        this.CanvasShortcuts.plotAxis(this.ui_ctx, 'right', [0, maxPower], powerTicks, DrawBoard.PLOT_MARGINS, null, 'red');
        this.CanvasShortcuts.plotAxis(this.ui_ctx, 'top', [0, vehicle.maxRPM], [], DrawBoard.PLOT_MARGINS, null);
        this.CanvasShortcuts.plotAxis(this.ui_ctx, 'bottom', [0, vehicle.maxRPM], rpmTicks, DrawBoard.PLOT_MARGINS, { values: rpmTicks, color: 'darkgrey', dashArray: [2, 3] }, 'black');

        this.CanvasShortcuts.plotData(this.ui_ctx, new Array(vehicle.max.torque.curve.length).fill(0), 0, maxTorque, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 0 });
        this.CanvasShortcuts.plotData(this.ui_ctx, new Array(vehicle.max.power.curve.length).fill(0), 0, maxPower, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 0 });
    }

    /**
     * Draw the maximum power and torque curve
     * @param {VehicleCurves} vehicle the vehicle object
     */
    plotStaticGraphs(vehicle) {
        // console.info('plotStatic'); // DEBUG

        this.plotStaticUi(vehicle);
        if (this.isStaticCurveHide) {
            return;
        }

        this.max_ctx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

        const maxTorque = Math.ceil(vehicle.max.torque.max / DrawBoard.VALUE_INTERVAL) * DrawBoard.VALUE_INTERVAL;
        const maxPower = Math.ceil(vehicle.max.power.max / DrawBoard.VALUE_INTERVAL) * DrawBoard.VALUE_INTERVAL;

        // draw static curve
        this.CanvasShortcuts.plotData(this.max_ctx, vehicle.max.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: 'black', dashArray: vehicle.max.dashArray });
        this.CanvasShortcuts.plotData(this.max_ctx, vehicle.max.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: 'red', dashArray: vehicle.max.dashArray });
    }


    /**
     * Draw the current power and torque curve
     * @param {VehicleCurves} vehicle the vehicle object
     */
    plotDynamicGraphs(vehicle) {
        // console.info('plotDynamic'); // DEBUG
        this.dyno_ctx.clearRect(0, 0, this.dynoCanvas.width, this.dynoCanvas.height);

        const maxTorque = Math.ceil(vehicle.max.torque.max / DrawBoard.VALUE_INTERVAL) * DrawBoard.VALUE_INTERVAL;
        const maxPower = Math.ceil(vehicle.max.power.max / DrawBoard.VALUE_INTERVAL) * DrawBoard.VALUE_INTERVAL;

        // draw dynamic curve
        this.CanvasShortcuts.plotData(this.dyno_ctx, vehicle.current.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: DrawBoard.PLOT_MARGINS, lineWidth: 2, lineColor: 'black', dashArray: vehicle.current.dashArray });
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

    resize(){
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
}

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

        if (torque >= VehicleCurves.MIN_TORQUE) {
            // update current curve data
            const currentIndex = Math.floor(rpmInd / (100 - VehicleCurves.PRECISION_FACTOR));
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
                            <button style="border: thin solid darkgrey; border-radius: 3px; background: transparent;" ng-click="resetCurrentData()">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                    <path
                                        d="M566.6 9.4c12.5 12.5 12.5 32.8 0 45.3l-192 192 34.7 34.7c4.2 4.2 6.6 10 6.6 16c0 12.5-10.1 22.6-22.6 22.6H364.3L256 211.7V182.6c0-12.5 10.1-22.6 22.6-22.6c6 0 11.8 2.4 16 6.6l34.7 34.7 192-192c12.5-12.5 32.8-12.5 45.3 0zm-344 225.5L341.1 353.4c3.7 42.7-11.7 85.2-42.3 115.8C271.4 496.6 234.2 512 195.5 512L22.1 512C9.9 512 0 502.1 0 489.9c0-6.3 2.7-12.3 7.3-16.5L133.7 359.7c4.2-3.7-.4-10.4-5.4-7.9L77.2 377.4c-6.1 3-13.2-1.4-13.2-8.2c0-31.5 12.5-61.7 34.8-84l8-8c30.6-30.6 73.1-45.9 115.8-42.3zM464 352a80 80 0 1 1 0 160 80 80 0 1 1 0-160z" />
                                </svg>
                            </button>
                            <button style="border: thin solid darkgrey; border-radius: 3px; background: transparent;" ng-click="hideStaticCurve()">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"
                                    style="display: {{drawBoard.isStaticCurveHide ? 'none' : 'block'}};">
                                    <path
                                        d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"
                                    style="display: {{drawBoard.isStaticCurveHide ? 'block' : 'none'}};">
                                    <path
                                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
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

                    $scope.isMaxCuveHide = false;

                    $scope.resetCurrentData = function () {
                        $scope.vehicles[$scope.vehicleID].resetCurrent();
                    };

                    $scope.hideStaticCurve = () => { $scope.drawBoard.hideStaticCurve(); }
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
                            scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID]);
                        }
                    });


                    scope.graph = function () {
                        scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID])
                    }


                    scope.$on('streamsUpdate', function (event, streams) {
                        if (streams.engineInfo != undefined && scope.vehicleID != '') {
                            const ENGINE_RPM_INDEX = 4;
                            const ENGINE_TORQUE_INDEX = 8;

                            const _rpm = streams.engineInfo[ENGINE_RPM_INDEX] <= scope.vehicles[scope.vehicleID].maxRPM ? streams.engineInfo[ENGINE_RPM_INDEX] : scope.vehicles[scope.vehicleID].maxRPM;
                            const torque = streams.engineInfo[ENGINE_TORQUE_INDEX] >= 0 ? streams.engineInfo[ENGINE_TORQUE_INDEX] : 0;

                            scope.vehicles[scope.vehicleID].updateCurrentValues(_rpm, torque);
                            scope.currentData = scope.vehicles[scope.vehicleID].getObject();

                            scope.drawBoard.plotDynamicGraphs(scope.vehicles[scope.vehicleID]);
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
                            scope.drawBoard.plotStaticGraphs(scope.vehicles[scope.vehicleID]);
                        }
                    })
                }
            }
        }
    ]
)

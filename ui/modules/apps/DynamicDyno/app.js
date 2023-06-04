angular.module('beamng.apps')
  .directive('dynamicDyno', ['$log', 'CanvasShortcuts',
    function ($log, CanvasShortcuts) {
      return {
        template: `
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background-color: whitesmoke">

            <div style="height: 70%; position: relative" >
              <canvas style="position: absolute; top: 0; left: 0" width="50" height="50"></canvas>
              <canvas style="position: absolute; top: 0; left: 0" width="50" height="50"></canvas>
            </div>

            <div style="position: relative; height: 120px; padding: 10% overflow-x: auto; overflow-y: hidden" layout="row" layout-align="left center">
              <div layout="row" flex layout-padding>
                <table ng-repeat="(key, obj) in engines" style="vertical-align: center; font-size: 12px; margin: 0 4px 0 4px; padding: 0 3px 0 3px; border-left: 1px solid black; border-right: 1px solid black; border-radius: 2px;">
                  <tr><th colspan="2">{{ obj.name }}</th></tr>
                  <tr>
                    <td><graph-legend-tip type="line" color="black" dash-array="{{ obj.dashArray }}"></graph-legend-tip> {{:: "ui.apps.torquecurve.Torque" | translate}}</td>
                    <td style="font-family: monospace">{{ obj.torque.val.toFixed(2) }}/{{ obj.torque.max.toFixed(0) }}</td>
                    <td style="font-family: monospace; padding: 0 3px">[{{ obj.torque.units }}]</td>
                  </tr>
                  <tr>
                    <td><graph-legend-tip type="line" color="red" dash-array="{{ obj.dashArray }}"></graph-legend-tip> {{:: "ui.apps.torquecurve.Power" | translate}}</td>
                    <td style="font-family: monospace">{{ obj.power.val.toFixed(2) }}/{{ obj.power.max.toFixed(0) }}</td>
                    <td style="font-family: monospace; padding: 0 3px">[{{ obj.power.units }}]</td>
                  </tr>
                </table>
              </div>
            </div>

          </div>`,
        replace: true,
        restrict: 'EA',
        link: function (scope, element, attrs) {

          var streamsList = ['engineInfo']
          StreamsManager.add(streamsList)
          scope.$on('$destroy', function () {
            StreamsManager.remove(streamsList)
          })

          var margins = { top: 0, bottom: 0, left: 0, right: 0 }

          var canvasWrapper = element[0].children[1]
          var staticCanvas = element[0].getElementsByTagName('canvas')[0]
          var max_ctx = staticCanvas.getContext('2d')
          var dynamicCanvas = element[0].getElementsByTagName('canvas')[1]
          var cursor_ctx = dynamicCanvas.getContext('2d')
          // var dyno_ctx = dynamicCanvas.getContext('2d')
          var xFactor = -1

          var plotMargins = { top: 15, bottom: 25, left: 25, right: 26 }

          scope.engines = {};
          scope.vehicleID = '';

          scope.$on('VehicleChange', () => {
            scope.vehicleID = ''
          })


          scope.$on('TorqueCurveChanged', function (_, data) {
            let _data = JSON.parse(JSON.stringify(data));
            _data.curves.forEach(element => {
              element.power = [];
              element.torque = [];
            });
            console.log(JSON.stringify(_data));
            console.log("length curves : " + data.curves[0].power.length);

            if (scope.vehicleID !== data.vehicleID) {
              console.log("got a new vehicle"); // DEBUG
              // reset all torques curves
              scope.vehicleID = data.vehicleID
              scope.engines = generateDefaultEngineObject(data.maxRPM);
            }

            if (!scope.engines.max.engineNames.find(engineNames => engineNames === data.deviceName)) {
              // creating a new dynamic engine
              const maxPriority = Math.max(...data.curves.map(e => e.priority));
              const maxPriorityCurve = data.curves.find(element => element.priority == maxPriority);

              if (scope.engines.max.priority < maxPriority) {
                scope.engines.max.priority = maxPriority;
                scope.engines.max.torque.max = Math.max.apply(Math, maxPriorityCurve.torque);
                scope.engines.max.torque.curve = maxPriorityCurve.torque;
                scope.engines.max.power.max = Math.max.apply(Math, maxPriorityCurve.power);
                scope.engines.max.power.curve = maxPriorityCurve.power;

                scope.engines.max.engineNames.push(data.deviceName);
              }

              plotStaticGraphs();
            }
          });

          /**
           * Draw the maximum power and torque curve
           */
          function plotStaticGraphs() {
            xFactor = (dynamicCanvas.width - plotMargins.left - plotMargins.right) / scope.engines.max.maxRPM;

            max_ctx.clearRect(0, 0, staticCanvas.width, staticCanvas.height)

            const maxPower = Math.ceil(scope.engines.max.power.max / 250) * 250;
            const maxTorque = Math.ceil(scope.engines.max.torque.max / 250) * 250;
            var powerTicks = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1))
            var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1))
            var rpmTicks = Array(Math.floor(scope.engines.max.maxRPM / 1000) + 1).fill().map((x, i) => i * 1000)

            CanvasShortcuts.plotAxis(max_ctx, 'left', [0, maxTorque], torqueTicks, plotMargins, { numLines: torqueTicks.length, color: 'darkgrey', dashArray: [2, 3] }, 'black')
            CanvasShortcuts.plotAxis(max_ctx, 'right', [0, maxPower], powerTicks, plotMargins, null, 'red')
            CanvasShortcuts.plotAxis(max_ctx, 'top', [0, scope.engines.max.maxRPM], [], plotMargins, null)
            CanvasShortcuts.plotAxis(max_ctx, 'bottom', [0, scope.engines.max.maxRPM], rpmTicks, plotMargins, { values: rpmTicks, color: 'darkgrey', dashArray: [2, 3] }, 'black')

            // draw static curve
            CanvasShortcuts.plotData(max_ctx, scope.engines.max.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: plotMargins, lineWidth: 2, lineColor: 'black', dashArray: scope.engines.max.dashArray })
            CanvasShortcuts.plotData(max_ctx, scope.engines.max.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: plotMargins, lineWidth: 2, lineColor: 'red', dashArray: scope.engines.max.dashArray })
            // draw dynamic curve
            CanvasShortcuts.plotData(max_ctx, scope.engines.current.torque.curve.map(key => UiUnits.torque(key).val), 0, maxTorque, { margin: plotMargins, lineWidth: 2, lineColor: 'black', dashArray: [] })
            CanvasShortcuts.plotData(max_ctx, scope.engines.current.power.curve.map(key => UiUnits.power(key).val), 0, maxPower, { margin: plotMargins, lineWidth: 2, lineColor: 'red', dashArray: [] })
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


          /**
           * generate a default engine object
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
                  rawCurve: new Array(maxRPM).fill(0),
                  curve: new Array(maxRPM).fill(0)
                },
                power: {
                  val: 0,
                  max: 0,
                  units: UiUnits.power(0).unit,
                  rawCurve: new Array(maxRPM).fill(0),
                  curve: new Array(maxRPM).fill(0)
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
          }


          scope.graph = function () {
            plotStaticGraphs()
          }

          scope.$on('streamsUpdate', function (event, streams) {
            // console.log("streams changed:" + JSON.stringify(streams))
            // console.log(JSON.stringify(scope.engines)); // DEBUG
            if (streams.engineInfo != undefined && scope.engines.max != undefined && scope.engines.current != undefined) {
              // console.log(JSON.stringify(scope.vehicleID)); // DEBUG

              const ENGINE_RPM_INDEX = 4;
              const ENGINE_TORQUE_INDEX = 8;

              const _rpm = streams.engineInfo[ENGINE_RPM_INDEX] <= scope.engines.max.maxRPM ? streams.engineInfo[ENGINE_RPM_INDEX] : scope.engines.max.maxRPM;
              const rpmInd = Math.floor(_rpm);

              // update dynamic dyno data for this RPM
              const torque = streams.engineInfo[ENGINE_TORQUE_INDEX] >= 0 ? streams.engineInfo[ENGINE_TORQUE_INDEX] : 0;
              const power = ((2 * Math.PI * _rpm * torque) / 60) / 736;

              // update current curve data
              scope.engines.current.torque.rawCurve[rpmInd] = torque;
              scope.engines.current.power.rawCurve[rpmInd] = power;

              scope.engines.current.torque.curve = smoothCurve(scope.engines.current.torque.rawCurve);
              scope.engines.current.power.curve = smoothCurve(scope.engines.current.power.rawCurve);

              // update max value for current curve
              scope.engines.current.torque.max = Math.max(scope.engines.current.torque.max, torque);
              scope.engines.current.power.max = Math.max(scope.engines.current.power.max, power);

              // update vals
              scope.engines.current.torque.val = torque;
              scope.engines.current.power.val = power;

              scope.engines.max.torque.val = scope.engines.max.torque.curve[rpmInd];
              scope.engines.max.power.val = scope.engines.max.power.curve[rpmInd];

              drawCursor(_rpm);
              plotStaticGraphs();
            }
          });


          function smoothCurve(curve) {
            const ROLLING_AVERAGE_SIZE = 10;
            let _curve = curve;

            // const maxLength = _curve.length;

            // for (let i = 0; i < maxLength; i++) {
            //   if(_curve[i] == 0){
            //     _arr = Array.prototype.concat((i - ROLLING_AVERAGE_SIZE < 0 ? (new Array(Math.abs(i - ROLLING_AVERAGE_SIZE)).fill(0)) : [])
            //       + _curve.slice(i - ROLLING_AVERAGE_SIZE >= 0 ? Math.abs(i - ROLLING_AVERAGE_SIZE) : 0, i + ROLLING_AVERAGE_SIZE <= maxLength ? Math.abs(i + ROLLING_AVERAGE_SIZE) : maxLength)
            //       + (i + ROLLING_AVERAGE_SIZE > maxLength ? (new Array((i + ROLLING_AVERAGE_SIZE) - maxLength).fill(0)) : []));


            //     var total = 0;
            //     for (var e in _arr) {
            //       total += e;
            //     }
            //     const average = total / _arr.length;

            //     _curve[i] = average;

            //   }


            // }

            // console.log(JSON.stringify(_curve));  // DEBUG
            return _curve;
          }



          var _ready = false;

          scope.$on('app:resized', function (event, data) {
            // We can use this event as initialization trigger since it is emitted from
            // the app-container for this reason
            staticCanvas.width = canvasWrapper.offsetWidth;
            staticCanvas.height = canvasWrapper.offsetHeight + plotMargins.bottom;
            dynamicCanvas.width = canvasWrapper.offsetWidth;
            dynamicCanvas.height = canvasWrapper.offsetHeight + plotMargins.bottom;

            if (!_ready) {
              _ready = true;
              bngApi.activeObjectLua('controller.mainController.sendTorqueData()');
            } else {
              plotStaticGraphs();
            }
          })

          scope.$on('VehicleFocusChanged', function () {
            bngApi.activeObjectLua('controller.mainController.sendTorqueData()');
          })

        }
      }
    }])

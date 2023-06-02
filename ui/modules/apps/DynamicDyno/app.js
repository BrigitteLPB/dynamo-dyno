angular.module('beamng.apps')
  .directive('dynamicDyno', ['$log', 'CanvasShortcuts',
    function ($log, CanvasShortcuts) {
      return {
        template: `

          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background-color: whitesmoke">
            <!-- RPM -->
            <p>speed  : {{ engine.rpm.current | number : '0':'fr' }} RPM</p>
            <div layout="row" layout-align="space-between">
              <div flex="97" style="background-color:#b2b3b5; height: 5px; overflow: hidden;">
                <div style="font-size: 6px; background-color:#555; width:{{ engine.rpm.current > 0 ? ( 100 * ( engine.rpm.current <= engine.rpm.max ? engine.rpm.current : engine.rpm.max ) / engine.rpm.max ) : 0 }}%;">&nbsp;</div>
              </div>
              <div style="background-color:#500; height: 5px; width: 3%; overflow: hidden;">
                <div style="font-size: 6px; background-color:#F00; width:{{ engine.rpm.current > engine.rpm.max ? ( 100 * ( engine.rpm.current - engine.rpm.max ) / ( ( engine.rpm.max * 3 ) / 97 ) ) : 0 }}%;">&nbsp;</div>
              </div>
            </div>

            <!-- Torque -->
            <p>torque : {{ engine.torque.current | number : '0':'fr' }} N.m</p>
            <div layout="row" layout-align="space-between">
              <div flex="9" style="display:flex; justify-content:flex-end; background-color:#b2b3b5; height: 5px; overflow: hidden;">
                <div style="font-size: 6px; background-color:#555; width:{{ engine.torque.current < 0 ? (100 * ( engine.torque.current >= -100 ? engine.torque.current : -100 ) / -100) : 0 }}%;">&nbsp;</div>
              </div>
              <div style="background-color:#555; height: 5px; width: 1%;">
              </div>
              <div flex="90" style="background-color:#b2b3b5; height: 5px; overflow: hidden;">
                <div style="font-size: 6px; background-color:#555; width:{{ engine.torque.current > 0 ? ( 100 * ( engine.torque.current <= engine.torque.max ? engine.torque.current : engine.torque.max ) / engine.torque.max ) : 0 }}%;">&nbsp;</div>
              </div>
            </div>

            <!-- Power -->
            <p>power  : {{ engine.power.hp.current | number : '0':'fr' }} hp</p>
            <div layout="row" layout-align="space-between">
              <div flex="9" style="display:flex; justify-content:flex-end; background-color:#b2b3b5; height: 5px; overflow: hidden;">
                <div style="font-size: 6px; background-color:#555; width:{{ engine.power.hp.current < 0 ? (100 * ( engine.power.hp.current >= -100 ? engine.power.hp.current : -100 ) / -100) : 0 }}%;">&nbsp;</div>
              </div>
              <div style="background-color:#555; height: 5px; width: 1%;">
              </div>
              <div flex="90" style="background-color:#b2b3b5; height: 5px; overflow: hidden;">
                <div style="font-size: 6px; background-color:#555; width:{{ engine.power.hp.current > 0 ? ( 100 * ( engine.power.hp.current <= engine.power.hp.max ? engine.power.hp.current : engine.power.hp.max ) / engine.power.hp.max ) : 0 }}%;">&nbsp;</div>
              </div>
            </div>
          </div>

        `,
        replace: true,
        restrict: 'EA',
        controller: ['$scope', function ($scope) {
          // settings default values
          $scope.engine = {
            rpm: {
              idle: 0,
              current: 0,
              max: 0
            },
            torque: {
              current: 0,
              max: 0
            },
            power: {
              hp: {
                current: 0,
                max: 0
              },
              watt: {
                current: 0,
                max: 0
              }
            }
          }
        }],

        link: function (scope, element, attrs) {

          var streamsList = ['engineInfo']
          StreamsManager.add(streamsList)
          scope.$on('$destroy', function () {
            StreamsManager.remove(streamsList)
          })


          // scope.config = {}

          // var currentVehicle = {
          //   id: '',
          //   engines: []
          // }

          // scope.engineIndex = -1
          // scope.engines = []

          // scope.selectedEngine = ''

          // scope.$on('VehicleChange', () => {
          //   currentVehicle.id = ''
          // })


          scope.$on('TorqueCurveChanged', function (_, data) {
            setTimeout(function () {
              scope.engine.rpm.max = data.maxRPM;
              scope.engine.torque.max = data.maxTorque;
              scope.engine.power.hp.max = data.maxPower;
              scope.engine.power.watt.max = data.maxPower * 736;

              // console.log(JSON.stringify(scope.engine));
            }, 0)

          })

          // scope.$on('TorqueCurveChanged', function (_, data) {
          //   console.log('ALL DATA:', data)
          //   setTimeout(function () {
          //     if (data.vehicleID !== currentVehicle.id) {
          //       console.log('new vehicle!!')
          //       currentVehicle.id = data.vehicleID
          //       currentVehicle.engines = []
          //       scope.engines = []
          //       scope.engineIndex = -1
          //       scope.selectedEngine = ''
          //       console.log('new vehicle', data.vehicleID)
          //     }

          //     if (! currentVehicle.engines.find(engine => engine.name === data.deviceName)) {
          //       currentVehicle.engines.push({name: data.deviceName, curves: data.curves, maxRPM: data.maxRPM})
          //       scope.curves = data.curves
          //       // scope.engines.push({index: currentVehicle.engines.length - 1, name: data.deviceName})
          //       scope.engines.push(data.deviceName)
          //       console.log('new engine:', data.deviceName)
          //     } else {
          //       console.log('already have', data.deviceName)
          //     }

          //     scope.$evalAsync(() => {
          //       if (scope.engineIndex < 0) {
          //         scope.selectEngine(0)
          //       }
          //     })

          //   }, 0)

          // })

          // scope.onEngineSelection = () => {
          //   console.log('changed to engine', scope.selectedEngine)
          //   var ind = scope.engines.indexOf(scope.selectedEngine)
          //   if (ind > -1)
          //     scope.selectEngine(ind)
          // }

          // scope.selectEngine = (engineIndex) => {
          //   console.log('selecting', engineIndex, currentVehicle.engines[engineIndex])
          //   for (var key in scope.config) {
          //     scope.config[key].power.data = []
          //     scope.config[key].power.max = 0
          //     scope.config[key].torque.data = []
          //     scope.config[key].torque.max = 0
          //     scope.config[key].isPresent = false
          //   }

          //   maxRpm = currentVehicle.engines[engineIndex].maxRPM
          //   updateScopeData(currentVehicle.engines[engineIndex].curves)
          //   scope.engineIndex = engineIndex
          //   plotStaticGraphs()

          //   scope.selectedEngine = currentVehicle.engines[engineIndex].name
          //   scope.engineIndex = engineIndex
          //   scope.$evalAsync()
          // }

          // scope.$on('SettingsChanged', function () {
          //   bngApi.activeObjectLua('controller.mainController.sendTorqueData()')
          // })

          // var updateScopeData = function (curves) {
          //   for (var key in curves) {
          //     var mp = Math.max.apply(Math, curves[key].power),
          //         mt = Math.max.apply(Math, curves[key].torque)

          //     scope.config[key] = {
          //       torque: {
          //         color: 'black',
          //         dashArray: curves[key].dash ? curves[key].dash : [],
          //         width: curves[key].width,
          //         data: curves[key].torque.map(key => UiUnits.torque(key).val ),
          //         max: UiUnits.torque(mt).val ,
          //         units: UiUnits.torque(mp).unit
          //       },
          //       power: {
          //         color: 'red',
          //         dashArray: curves[key].dash ? curves[key].dash : [],
          //         width: curves[key].width,
          //         data: curves[key].power.map(key => UiUnits.power(key).val ),
          //         max: UiUnits.power(mp).val,
          //         units: UiUnits.power(mp).unit
          //       },
          //       isPresent: key < 2 ? true : false,  // only displays first two curves by default
          //       name: curves[key].name
          //     }
          //   }
          // }

          // var plotStaticGraphs = function () {
          //   xFactor = (dynamicCanvas.width - plotMargins.left - plotMargins.right) / maxRpm
          //   sctx.clearRect(0, 0, staticCanvas.width, staticCanvas.height)

          //   var maxPower = 0 , maxTorque = 0

          //   for (var key in scope.config) {
          //     if (scope.config[key].isPresent) {
          //       maxPower  = Math.max(maxPower,  scope.config[key].power.max)
          //       maxTorque = Math.max(maxTorque, scope.config[key].torque.max)
          //     }
          //   }

          //   var maxPower  = Math.ceil(maxPower / 250) * 250
          //   var maxTorque = Math.ceil(maxTorque / 250) * 250
          //   var powerTicks  = Array(6).fill().map((x, i, a) => i * maxPower / (a.length - 1))
          //   var torqueTicks = Array(6).fill().map((x, i, a) => i * maxTorque / (a.length - 1))
          //   var rpmTicks    = Array( Math.floor(maxRpm/1000) + 1 ).fill().map((x, i) => i*1000)

          //   CanvasShortcuts.plotAxis(sctx, 'left',  [0, maxTorque], torqueTicks, plotMargins, {numLines: torqueTicks.length, color: 'darkgrey', dashArray: [2, 3]}, 'black')
          //   CanvasShortcuts.plotAxis(sctx, 'right', [0, maxPower],  powerTicks,  plotMargins,  null,                          'red')
          //   CanvasShortcuts.plotAxis(sctx, 'top',     [0, maxRpm],          [], plotMargins,      null)
          //   CanvasShortcuts.plotAxis(sctx, 'bottom',  [0, maxRpm], rpmTicks, plotMargins, {values: rpmTicks, color: 'darkgrey', dashArray: [2, 3]} , 'black')

          //   Object.keys(scope.config).forEach(function (x) {
          //     var cc = scope.config[x]
          //     if (!cc.isPresent) return
          //     CanvasShortcuts.plotData(sctx, cc.torque.data, 0, maxTorque, {margin: plotMargins, lineWidth: cc.torque.width, lineColor: cc.torque.color, dashArray: cc.torque.dashArray })
          //     CanvasShortcuts.plotData(sctx, cc.power.data,  0, maxPower,  {margin: plotMargins, lineWidth: cc.power.width,  lineColor: cc.power.color,  dashArray: cc.power.dashArray  })
          //   })
          // }

          // scope.graph = function () {
          //   plotStaticGraphs()
          // }

          scope.$on('streamsUpdate', function (event, streams) {
            // console.log("streams changed:" + JSON.stringify(streams))
            const ENGINE_SPEED_INDEX = 4;
            const ENGINE_TORQUE_INDEX = 8;

            // scope.rpm = streams.engineInfo[ENGINE_SPEED_INDEX];
            // scope.torque = streams.engineInfo[ENGINE_TORQUE_INDEX];
            scope.engine.rpm.current = streams.electrics.rpmTacho;
            scope.engine.torque.current = streams.powertrainDeviceData.devices.mainEngine.outputTorque[0];
            scope.engine.power.watt.current = (2 * Math.PI * scope.engine.rpm.current * scope.engine.torque.current) / 60;
            scope.engine.power.hp.current = scope.engine.power.watt.current / 736;
          })

          // var _ready = false

          // scope.$on('app:resized', function (event, data) {
          //   // We can use this event as initialization trigger since it is emitted from
          //   // the app-container for this reason
          //   staticCanvas.width = canvasWrapper.offsetWidth
          //   staticCanvas.height = canvasWrapper.offsetHeight+plotMargins.bottom
          //   dynamicCanvas.width = canvasWrapper.offsetWidth
          //   dynamicCanvas.height = canvasWrapper.offsetHeight+plotMargins.bottom

          //   if (!_ready) {
          //     _ready = true
          //     bngApi.activeObjectLua('controller.mainController.sendTorqueData()')
          //   } else {
          //     plotStaticGraphs()
          //   }
          // })

          // scope.$on('VehicleFocusChanged', function() {
          //   bngApi.activeObjectLua('controller.mainController.sendTorqueData()')
          // })

        }
      }
    }])

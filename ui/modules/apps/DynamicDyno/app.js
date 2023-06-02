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
          $scope.vehicle = {
            id: 0,
            engineNames: []
          };
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



          scope.$on('TorqueCurveChanged', function (_, data) {
              if (data.vehicleID !== scope.vehicle.id) {
                scope.vehicle.id = data.vehicleID;
                scope.vehicle.engineNames = [{name: data.deviceName}];

                scope.engine.rpm.max = data.maxRPM;
                scope.engine.torque.max = data.maxTorque;
                scope.engine.power.hp.max = data.maxPower;
                scope.engine.power.watt.max = data.maxPower * 736;
              } else {
                // check if we already have this engine
                if (!scope.vehicle.engineNames.find(engine => engine.name === data.deviceName)) {
                  scope.vehicle.engineNames.push({name: data.deviceName});

                  scope.engine.rpm.max = Math.max(scope.engine.rpm.max, data.maxRPM);
                  scope.engine.torque.max += data.maxTorque;
                  scope.engine.power.hp.max += data.maxPower;
                  scope.engine.power.watt.max += data.maxPower * 736;

                }
              }

              // console.log(JSON.stringify(data));  // DEBUG
              // console.log(JSON.stringify(scope.engine));  // DEBUG
              // console.log(JSON.stringify(scope.vehicle));  // DEBUG
          });


          scope.$on('streamsUpdate', function (event, streams) {
            const ENGINE_SPEED_INDEX = 4;
            const ENGINE_TORQUE_INDEX = 8;


            scope.engine.rpm.current = streams.engineInfo[ENGINE_SPEED_INDEX];
            scope.engine.torque.current = streams.engineInfo[ENGINE_TORQUE_INDEX];
            scope.engine.power.watt.current = (2 * Math.PI * scope.engine.rpm.current * scope.engine.torque.current) / 60;
            scope.engine.power.hp.current = scope.engine.power.watt.current / 736;


            // console.log(JSON.stringify(streams));  // DEBUG
            // console.log(JSON.stringify(scope.engine));  // DEBUG
          })
        }
      }
    }])

angular.module('beamng.apps')
  .directive('dynamicDyno', ['$log', 'CanvasShortcuts',
    function ($log, CanvasShortcuts) {
      return {
        template: `
          <svg
              width="100%"
              height="100%"
              viewBox="0 0 79.374799 31.749998"
              version="1.1"
              id="svg5"
              inkscape:version="1.2.2 (732a01da63, 2022-12-09)"
              sodipodi:docname="dynamic-dyno.svg"
              inkscape:export-filename="dynamic-dyno.svg"
              inkscape:export-xdpi="25.4"
              inkscape:export-ydpi="25.4"
              xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
              xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:svg="http://www.w3.org/2000/svg">
            <sodipodi:namedview
                id="namedview7"
                pagecolor="#505050"
                bordercolor="#eeeeee"
                borderopacity="1"
                inkscape:showpageshadow="0"
                inkscape:pageopacity="0"
                inkscape:pagecheckerboard="0"
                inkscape:deskcolor="#505050"
                inkscape:document-units="mm"
                showgrid="true"
                inkscape:zoom="5.6568542"
                inkscape:cx="148.84598"
                inkscape:cy="69.826795"
                inkscape:window-width="2560"
                inkscape:window-height="1361"
                inkscape:window-x="-9"
                inkscape:window-y="-9"
                inkscape:window-maximized="1"
                inkscape:current-layer="layer1"
                inkscape:lockguides="false">
              <inkscape:grid
                  type="xygrid"
                  id="grid553"
                  empspacing="10"
                  spacingx="0.26458333"
                  originx="104.99677"
                  originy="148.50009"
                  enabled="true"
                  visible="true"
                  snapvisiblegridlinesonly="true" />
            </sodipodi:namedview>
            <defs
                id="defs2">
              <rect
                  x="173.89658"
                  y="426.62628"
                  width="187.90005"
                  height="23.503693"
                  id="rect127" />
              <rect
                  x="168.3233"
                  y="366.15784"
                  width="189.68913"
                  height="15.08046"
                  id="rect117" />
            </defs>
            <g
                inkscape:label="Calque 1"
                inkscape:groupmode="layer"
                id="layer1">
              <rect
                  style="opacity:1;fill:#999999;fill-opacity:1;stroke-width:0.279816;image-rendering:auto"
                  id="rect1526"
                  width="79.374992"
                  height="31.749998"
                  x="-9.7999997e-05"
                  y="-31.749998"
                  inkscape:label="rect1526"
                  transform="scale(1,-1)" />
              <text
                  xml:space="preserve"
                  transform="matrix(0.32048449,0,0,0.35241066,-52.998051,-128.21345)"
                  id="text115"
                  style="white-space:pre;shape-inside:url(#rect117);display:inline;fill:#000000"><tspan
                    x="168.32422"
                    y="377.10617"
                    id="tspan2143">Dynamic Dyno - By BrigitteLPB</tspan></text>
              <g
                  inkscape:groupmode="layer"
                  id="layer2"
                  inkscape:label="Calque 2">
                <text
                    xml:space="preserve"
                    style="font-size:3.27522px;fill:#000000;stroke-width:0.272935"
                    x="2.3258896"
                    y="10.31875"
                    id="text123"><tspan
                      sodipodi:role="line"
                      id="tspan121"
                      style="stroke-width:0.272935"
                      x="2.3258896"
                      y="10.31875">RPM:     {{ engine.rpm.current | number : '0' }}</tspan></text>
                <text
                    xml:space="preserve"
                    style="font-size:2.03491px;fill:#000000;stroke-width:0.169576"
                    x="3.3347297"
                    y="13.758335"
                    id="text123-4"><tspan
                      sodipodi:role="line"
                      id="tspan121-9"
                      style="stroke-width:0.169576"
                      x="3.3347297"
                      y="13.758335">└ MAX:     {{ engine.rpm.max | number : '0' }} RPM</tspan></text>
                <foreignObject
                  width="53"
                  height="4"
                  x="25"
                  y="9"
                  id="foreignObject123-1">
                    <div layout="row" layout-align="space-between" xmlns="http://www.w3.org/1999/xhtml"  style="height: 100%;">
                      <div style="background-color:#b2b3b5; width: 95%; height: 100%; overflow: hidden;" xmlns="http://www.w3.org/1999/xhtml">
                        <div style="font-size: 6px; background-color:#555; width:{{ engine.rpm.current > 0 ? ( 100 * ( engine.rpm.current <= engine.rpm.max ? engine.rpm.current : engine.rpm.max ) / engine.rpm.max ) : 0}}%; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">&nbsp;</div>
                      </div>
                      <div style="background-color:#500; width: 5%; height: 100%; overflow: hidden;" xmlns="http://www.w3.org/1999/xhtml">
                        <div style="font-size: 6px; background-color:#F00; width:{{ engine.rpm.current > engine.rpm.max ? ( 100 * ( engine.rpm.current - engine.rpm.max ) / ( ( engine.rpm.max * 5 ) / 95 ) ) : 0}}%; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">&nbsp;</div>
                      </div>
                    </div>
                  </foreignObject>
              </g>
              <g
                  inkscape:groupmode="layer"
                  id="layer3"
                  inkscape:label="Calque 3"
                  transform="translate(0,1.0583333)">
                  <text
                    xml:space="preserve"
                    transform="matrix(0.25653867,0,0,0.28504294,-42.831087,-107.68867)"
                    id="text125"
                    style="white-space:pre;shape-inside:url(#rect127);display:inline;fill:#000000"><tspan
                    x="173.89648"
                    y="437.57492"
                    id="tspan2145">Torque (N.m):  {{ engine.torque.current | number : '0' }}</tspan></text>
                  <text
                      xml:space="preserve"
                      style="font-size:2.03491px;fill:#000000;stroke-width:0.169576"
                      x="3.3347297"
                      y="20.637501"
                      id="text123-4-3"><tspan
                        sodipodi:role="line"
                        id="tspan121-9-6"
                        style="stroke-width:0.169576"
                        x="3.3347297"
                        y="20.637501">└ MAX:     {{ engine.torque.max | number : '0' }} N.m</tspan></text>
                  <foreignObject
                    width="53"
                    height="3"
                    x="25"
                    y="20"
                    id="foreignObject123-2">
                      <div layout="row" layout-align="space-between" xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;">
                        <div style="display:flex; justify-content:flex-end; background-color:#b2b3b5; width: 9%; height: 100%; overflow: hidden;" xmlns="http://www.w3.org/1999/xhtml">
                          <div style="font-size: 6px; background-color:#555; width:{{ engine.torque.current < 0 ? (100 * ( engine.torque.current >= -100 ? engine.torque.current : -100 ) / -100) : 0 }}%;" xmlns="http://www.w3.org/1999/xhtml">&nbsp;</div>
                        </div>
                        <div style="background-color:#555; height: 100%; width: 1%;" xmlns="http://www.w3.org/1999/xhtml">
                        </div>
                        <div style="background-color:#b2b3b5; width: 90%; height: 100%; overflow: hidden;" xmlns="http://www.w3.org/1999/xhtml">
                          <div style="font-size: 6px; background-color:#555; width:{{ engine.torque.current > 0 ? ( 100 * ( engine.torque.current <= engine.torque.max ? engine.torque.current : engine.torque.max ) / engine.torque.max ) : 0 }}%;" xmlns="http://www.w3.org/1999/xhtml">&nbsp;</div>
                        </div>
                      </div>
                    </foreignObject>
              </g>
              <g
                  inkscape:groupmode="layer"
                  id="layer4"
                  inkscape:label="Calque 4"
                  transform="translate(0,2.1166667)">
                  <text
                    xml:space="preserve"
                    style="font-size:3.56491px;fill:#000000;stroke-width:0.297076"
                    x="2.2975993"
                    y="24.287703"
                    id="text183"><tspan
                    sodipodi:role="line"
                    id="tspan181"
                    style="stroke-width:0.297076"
                    x="2.2975993"
                    y="24.287703">Power (HP): {{ engine.power.hp.current | number : '0' }}</tspan></text>
                  <text
                      xml:space="preserve"
                      style="font-size:2.03491px;fill:#000000;stroke-width:0.169576"
                      x="3.3347297"
                      y="27.516668"
                      id="text123-4-3-9"><tspan
                        sodipodi:role="line"
                        id="tspan121-9-6-5"
                        style="stroke-width:0.169576"
                        x="3.3347297"
                        y="27.516668">└ MAX:     {{ engine.power.hp.max | number : '0' }} HP</tspan></text>
                  <foreignObject
                    width="53"
                    height="3"
                    x="25"
                    y="25"
                    id="foreignObject123-2">
                      <div layout="row" layout-align="space-between" xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;">
                        <div style="display:flex; justify-content:flex-end; background-color:#b2b3b5; width: 9%; height: 100%; overflow: hidden;" xmlns="http://www.w3.org/1999/xhtml">
                          <div style="font-size: 6px; background-color:#555; width:{{ engine.power.hp.current < 0 ? (100 * ( engine.power.hp.current >= -100 ? engine.power.hp.current : -100 ) / -100) : 0 }}%; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">&nbsp;</div>
                        </div>
                        <div style="background-color:#555; height: 5px; width: 1%; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">
                        </div>
                        <div style="background-color:#b2b3b5; height: 5px; width: 90%; height: 100%; overflow: hidden;" xmlns="http://www.w3.org/1999/xhtml">
                          <div style="font-size: 6px; background-color:#555; width:{{ engine.power.hp.current > 0 ? ( 100 * ( engine.power.hp.current <= engine.power.hp.max ? engine.power.hp.current : engine.power.hp.max ) / engine.power.hp.max ) : 0 }}%; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">&nbsp;</div>
                        </div>
                      </div>
                    </foreignObject>
              </g>
              <rect
                  style="opacity:1;fill:#000000;stroke-width:0.217961"
                  id="rect1962"
                  width="79.374992"
                  height="0.26458332"
                  x="-9.7999997e-05"
                  y="6.614583" />
            </g>
          </svg>
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
              // console.log("new vehicle detected !"); // DEBUG

              scope.vehicle.id = data.vehicleID;
              scope.vehicle.engineNames = [{ name: data.deviceName }];

              scope.engine.torque.max = data.maxTorque;
              scope.engine.power.hp.max = data.maxPower;
              scope.engine.power.watt.max = data.maxPower * 736;
            } else {
              // console.log("got existing vehicle!"); // DEBUG

              // check if we already have this engine
              if (!scope.vehicle.engineNames.find(engine => engine.name === data.deviceName)) {
                scope.vehicle.engineNames.push({ name: data.deviceName });

                scope.engine.torque.max += data.maxTorque;
                scope.engine.power.hp.max += data.maxPower;
                scope.engine.power.watt.max += data.maxPower * 736;

              }
            }

            // console.log("data: " + JSON.stringify(data));  // DEBUG
            // console.log(`data RPM: ${data.maxRPM}, data Torque: ${data.maxTorque}, data Power: ${data.maxPower}`);  // DEBUG
            // console.log("engine: " + JSON.stringify(scope.engine));  // DEBUG
            // console.log("vehicle: " + JSON.stringify(scope.vehicle));  // DEBUG
          });


          scope.$on('streamsUpdate', function (event, streams) {
            const ENGINE_IDLE_SPEED_INDEX = 0;
            const ENGINE_MAX_SPEED_INDEX = 1;
            const ENGINE_SPEED_INDEX = 4;
            const ENGINE_TORQUE_INDEX = 8;

            if(streams.engineInfo != undefined){
              scope.engine.rpm.idle = streams.engineInfo[ENGINE_IDLE_SPEED_INDEX];
              scope.engine.rpm.max = streams.engineInfo[ENGINE_MAX_SPEED_INDEX];
              scope.engine.rpm.current = streams.engineInfo[ENGINE_SPEED_INDEX];
              scope.engine.torque.current = streams.engineInfo[ENGINE_TORQUE_INDEX];
              scope.engine.power.watt.current = (2 * Math.PI * scope.engine.rpm.current * scope.engine.torque.current) / 60;
              scope.engine.power.hp.current = scope.engine.power.watt.current / 736;
            }


            // console.log(JSON.stringify(streams));  // DEBUG
            // console.log(JSON.stringify(scope.engine));  // DEBUG
          })
        }
      }
    }])

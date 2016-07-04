// Import the interface to Tessel hardware
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var climatelib = require('climate-si7020');
//var lwtm2m = require('lwm2m-node-lib');
var config = require('./config');
var request = require('request');
var entity = require('./entity-config');

 

var ambient = ambientlib.use(tessel.port['A']);
var climate = climatelib.use(tessel.port['B']);

//lwtm2m.client.init(config);


request(entity.context_broker + '/version', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var res = JSON.parse(body);
        console.log(res)
    }
});




/*
//Before making any interaction with a Lightweight M2M server, a client must register to it. This registration can be done with the following function:
lwtm2m.client.register('127.0.0.1', config.server.port,  'testEndpoint',
    function (error, deviceInfo) {
      console.log(error.toString() + "--> "+deviceInfo);
        lwtm2m.client.registry.create("/d/1");

        lwtm2m.client.registry.get('/d/1', function (error, result) {
        console.log(error);
        });

    });

*/


/*lwtm2m.start({
    lifetime: '85671',
    version: '1.0',
    logLevel: 'DEBUG',
    observe: {
        period: 3000
    },
    ipProtocol: 'udp4',
    serverProtocol: 'udp4',
    formats: [
        {
            name: 'lightweightm2m/text',
            value: 1541
        }
    ],
    writeFormat: 'lightweightm2m/text'
}, function(error) {
    console.log('Listening');
});*/

var leds = tessel.led;
// ERR - Red
var red = leds[0];
// WLAN - Amber
var amber = leds[1];
// LED0 - Green
var green = leds[2];
// LED1 - Blue
var blue = leds[3];

ambient.on('ready', function () {
  // Get points of light and sound data.
  setInterval( function () {
    ambient.getLightLevel( function(err, lightdata) {


        if (err) {
            console.log('Light module error: '+err);

            green.off();

            setInterval(function(){
                red.toggle();

            },1000);

            throw err;
        }

        ambient.getSoundLevel( function(err, sounddata) {

            if (err) {
                console.log('Sound module error: '+err);
                green.off();

                setInterval(function(){
                    red.toggle();

                },1000);

                throw err;
            }


            var date = new Date();

            console.log(date.toString() +"Light level:", lightdata.toFixed(8), " ", "Sound Level:", sounddata.toFixed(8));


              request({
                  uri: entity.context_broker +'/v2/entities/viur-vessel/attrs/light/value',
                  json: false,
                  method: 'PUT',
                  headers: {'Content-Type':'text/plain'},
                  body: sounddata.toFixed(8)
              }, function (error, response, body) {


                  if (error) {
                      //var res = JSON.parse(body);
                      console.log(response.statusCode+' request error '+error);
                      green.off();

                      setInterval(function(){
                          amber.toggle();

                      },1000);
                  }

                  if(response.statusCode == 204) {
                      console.log('light sent');
                   }
              });

              request({
                  uri: entity.context_broker +'/v2/entities/viur-vessel/attrs/sound/value',
                  json: false,
                  method: 'PUT',
                  headers: {'Content-Type':'text/plain'},
                  body: lightdata.toFixed(8)
              }, function (error, response, body) {
                  console.log(response.statusCode);

                  if (error) {
                      if (error) {
                          //var res = JSON.parse(body);
                          console.log(response.statusCode+' request error '+error);
                          setInterval(function(){
                              amber.toggle();

                          },1000);
                      }
                  }

                  if(response.statusCode == 204) {
                      console.log('sound sent');
                  }
              });
      });
    });
  }, 60000); // The readings will happen every 60 seconds
});

ambient.on('error', function (err) {
    if (err) {
        red.on();
        console.log(err);
        throw err;
    }
});

climate.on('ready', function(){
  setInterval(function(){
    climate.readHumidity(function(err, humid){
      climate.readTemperature('c', function(err, temp){

        console.log('Degrees:', temp.toFixed(4) + 'C', 'Humidity:', humid.toFixed(2) + '%RH');

          request({
              uri: entity.context_broker +'/v2/entities/viur-vessel/attrs/temperature/value',
              json: false,
              method: 'PUT',
              headers: {'Content-Type':'text/plain'},
              body: temp.toFixed(2)
          }, function (error, response, body) {
              console.log(response.statusCode);

              if (error) {
                  //var res = JSON.parse(body);
                  console.log(response.statusCode+' request error '+error);
                  green.off();

                  setInterval(function(){
                      amber.toggle();

                  },1000);
              }

              if(response.statusCode == 204) {
                  console.log('temperature sent');
              }
          });

          request({
              uri: entity.context_broker +'/v2/entities/viur-vessel/attrs/humidity/value',
              json: false,
              method: 'PUT',
              headers: {'Content-Type':'text/plain'},
              body: humid.toFixed(2)
          }, function (error, response, body) {
              console.log(response.statusCode);

              if (error) {
                  //var res = JSON.parse(body);
                  console.log(response.statusCode+' request error '+error);
                  green.off();

                  setInterval(function(){
                      amber.toggle();

                  },1000);
              }

              if(response.statusCode == 204) {
                  console.log('humidity sent');
              }
          });
      });
    });
      
  }, 60000);
});

climate.on('error', function(err) {
    if (err) {
        red.on();
        console.log('error connecting module', err);
        throw err;
    }
});

console.log("Press CTRL + C to stop)");

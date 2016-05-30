// Import the interface to Tessel hardware
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var climatelib = require('climate-si7020');

var ambient = ambientlib.use(tessel.port['A']);
var climate = climatelib.use(tessel.port['B']);


ambient.on('ready', function () {
  // Get points of light and sound data.
  setInterval( function () {
    ambient.getLightLevel( function(err, lightdata) {
      if (err) throw err;
      ambient.getSoundLevel( function(err, sounddata) {
        if (err) throw err;
       
        console.log("Light level:", lightdata.toFixed(8), " ", "Sound Level:", sounddata.toFixed(8));
        //tessel.led[2].toggle();
      });
    });
  }, 2000); // The readings will happen every .5 seconds
});

ambient.on('error', function (err) {
  console.log(err);
});

climate.on('ready', function(){
  setInterval(function(){
    climate.readHumidity(function(err, humid){
      climate.readTemperature('c', function(err, temp){
        
        console.log('Degrees:', temp.toFixed(4) + 'C', 'Humidity:', humid.toFixed(4) + '%RH');
        //tessel.led[3].toggle();
      });
    });
  }, 2000);
});

climate.on('error', function(err) {
  console.log('error connecting module', err);
});

console.log("Press CTRL + C to stop)");

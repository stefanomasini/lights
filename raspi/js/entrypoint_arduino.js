import readline from 'readline';
//var SPI = require('pi-spi');
import { SerialPort} from 'serialport';


if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}



var serialPort = new SerialPort('/dev/ttyUSB0', {
    baudrate: 115200,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

 
//var spi = SPI.initialize("/dev/spidev0.0"),
    //test = Buffer([10,0, 0,1,2,3,4,5,6,7,8,9]);

//spi.clockSpeed(50000);
 
// reads and writes simultaneously
//console.log('Writing');
//spi.transfer(test, test.length, function (e,d) {
 //   if (e) console.error(e);
  //  else console.log("Got \""+d.toString()+"\" back.");
   // 
    ////if (test.toString() === d.toString()) {
        //console.log(msg);
    //} else {
        //// NOTE: this will likely happen unless MISO is jumpered to MOSI
        //console.warn(msg);
        //process.exit(-2);
    //}
//});

//while (true) {
 //   console.log('writing');
//}

function main() {
    rl.question('Hit Enter ', (text) => {
        var value = parseInt(text, 10);
        console.log('Writing');
        spi.write(Buffer([value]), function (e) { console.log(e); });
        //spi.write(test, function (e) { console.log(e); });
        main();
    });
}

var NUM_LEDS = 150;
var BATCH_SIZE = 30;
var i = 0;
function generateData(cb) {
    console.log(i);
    if (i*BATCH_SIZE < NUM_LEDS) {
        var letter = String.fromCharCode(65+i);
        var chunks = [];
        for (var idx=0; idx<BATCH_SIZE; idx += 1) {
            chunks.push((idx === i) ? 'aaa' : '!!!')
        }
        var cmd = 'A' + letter + chunks.join('');
        console.log(cmd);
        cb(cmd);
        i += 1;
    } else {
        cb('B');
        i = 0;
    }
    //rl.question('> ', text => cb(text));
}

serialPort.on('open', () => {
    console.log('open');
    serialPort.on('data', data => {
        console.log('data received: ' + data);
        data = `${data}`.trim();
        if (data.startsWith('OK')) {
            generateData(data => {
                serialPort.write(data+'\n', (err, results) => {
                    if (err) {
		        console.log('err ' + err);
                    } else {
		        console.log('results ' + results);
                    }
		});
            });
        }
    });
    //rl.question('> ', text => {
        //serialPort.write(text+'\n', (err, results) => {
            //console.log('err ' + err);
            //console.log('results ' + results);
        //});
    //});
});

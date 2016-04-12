import { SerialPort} from 'serialport';


var serialPort = new SerialPort('/dev/ttyUSB0', {
    baudrate: 115200,
});



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
});

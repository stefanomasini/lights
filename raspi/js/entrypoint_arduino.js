import { SerialPort} from 'serialport';
import { range, LedMatrix, SpeedBars, ScrollingText, OscilatingBar, runApps } from '../../js/animation';

import i2c from 'i2c-bus';

const NUM_ROWS = 10;
const ROW_LENGTH = 30;

let matrix = new LedMatrix(NUM_ROWS, ROW_LENGTH);

var scrollingText = new ScrollingText(matrix.submatrix([2,3,4,5,6,7,8], range(0, matrix.numCols)));
scrollingText.setText('vrijeschool mareland');

var speedBars = new SpeedBars(
    matrix.submatrix([0], range(0, matrix.numCols)),
    matrix.submatrix([1,2], range(0, matrix.numCols)),
    matrix.submatrix([3,4], range(0, matrix.numCols)),
    matrix.submatrix([5], range(0, matrix.numCols)),
);


runApps([
    speedBars,
    //new OscilatingBar(matrix.submatrix([0,1,9], range(0, matrix.numCols))),
    //scrollingText,
]);

var NUM_LEDS = 300;
var BATCH_SIZE = 30;
var i = 0;
var matrixData = null;

function generateCommand() {
    if (i*BATCH_SIZE < NUM_LEDS) {
        if (matrixData === null) {
            matrixData = matrix.rows.map(row => row.slice(0));
        }
        var letter = String.fromCharCode(65+i);
        var chunks = [];
        for (var idx=0; idx<BATCH_SIZE; idx += 1) {
            var led;
            led = matrixData[i][idx];
            chunks.push(String.fromCharCode(led.r * 63 + 33));
            chunks.push(String.fromCharCode(led.g * 63 + 33));
            chunks.push(String.fromCharCode(led.b * 63 + 33));
        }
        var cmd = 'A' + letter + chunks.join('');
        i += 1;
        return cmd;
    } else {
        i = 0;
        matrixData = null;
        return 'B';
    }
}

function handleSerialData(data, writeToSerial) {
    if (data.startsWith('OK')) {
        //writeToSerial(generateCommand());
    } else {
        //console.log(data);
    }
}

function runSerialPort(device, baudrate) {
    return new Promise((resolve, reject) => {
        var serialPort = new SerialPort(device, { baudrate: baudrate });
        var writeToSerial = (dataToWrite) => {
            serialPort.write(dataToWrite+'\n', (err, results) => {
                if (err) {
                    console.log('Error writing data: ' + err.message);
                }
            });
        };
        serialPort.on('open', () => {
            console.log('Serial port open');
            resolve(writeToSerial);
        });
        var dataBuffer = '';
        serialPort.on('data', data => {
            dataBuffer += data;
            var idxOfCr = dataBuffer.indexOf('\n');
            if (idxOfCr !== -1) {
                var dataLine = dataBuffer.slice(0, idxOfCr);
                dataBuffer = dataBuffer.slice(idxOfCr+1);
                handleSerialData(dataLine, writeToSerial);
            }
        });
        return serialPort;
    });
}

runSerialPort('/dev/ttyUSB0', 115200).then(writeToSerial => {
    setInterval(() => {
        writeToSerial(generateCommand());
        while (i !== 0) {
            writeToSerial(generateCommand());
        }
    }, 100);
});

var SENSOR_DEVICE_ADDR = 0x4;

var bus = i2c.open(1, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    function configureSensors(thresholdA, thresholdB, debounceMs) {
        bus.i2cWrite(SENSOR_DEVICE_ADDR, 8, new Buffer([1, thresholdA, 3, thresholdB, 2, debounceMs, 4, debounceMs]), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    configureSensors(10, 6, 20);
    var buf = new Buffer([0, 0]);
    function readFromBus() {
        bus.i2cRead(SENSOR_DEVICE_ADDR, 2, buf, (err, bytesRead) => {
            if (err) {
                console.log(err);
                return;
            }
            if (buf[0] === 1) {
                speedBars.pushButton(0);
            }
            if (buf[1] === 1) {
                speedBars.pushButton(1);
            }
        });
    }

    setInterval(readFromBus, 50);
});


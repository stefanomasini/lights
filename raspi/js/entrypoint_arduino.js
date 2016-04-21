import { SerialPort} from 'serialport';
import { range, LedMatrix, SpeedBars, ScrollingText, OscilatingBar, runApps } from '../../js/animation';

const NUM_ROWS = 10;
const ROW_LENGTH = 30;

let matrix = new LedMatrix(NUM_ROWS, ROW_LENGTH);

var scrollingText = new ScrollingText(matrix.submatrix([2,3,4,5,6,7,8], range(0, matrix.numCols)));
scrollingText.setText('vrijeschool mareland');

runApps([
    // speedBars,
    new OscilatingBar(matrix.submatrix([0,1,9], range(0, matrix.numCols))),
    scrollingText,
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
        writeToSerial(generateCommand());
    }
}


function runSerialPort(device, baudrate) {
    var serialPort = new SerialPort(device, { baudrate: baudrate });
    serialPort.on('open', () => {
        console.log('Serial port open');
    });
    serialPort.on('data', data => {
        data = `${data}`.trim();
        handleSerialData(data, (dataToWrite) => {
            serialPort.write(dataToWrite+'\n', (err, results) => {
                if (err) {
                    console.log('Error writing data: ' + err.message);
                }
            });
        });
    });
}

runSerialPort('/dev/ttyUSB0', 115200);


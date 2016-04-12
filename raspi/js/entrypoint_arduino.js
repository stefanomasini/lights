import { SerialPort} from 'serialport';
import { range, LedMatrix, SpeedBars, ScrollingText, OscilatingBar, runApps } from '../../js/animation';

const NUM_ROWS = 10;
const ROW_LENGTH = 30;

let matrix = new LedMatrix(NUM_ROWS, ROW_LENGTH);

var scrollingText = new ScrollingText(matrix.submatrix([2,3,4,5,6,7,8], range(0, matrix.numCols)));
scrollingText.setText('vrijeschool mareland');

runApps([
    // speedBars,
    new OscilatingBar(matrix.submatrix([0,1,2,3,4], range(0, matrix.numCols))),
    //scrollingText,
]);



var NUM_LEDS = 150;
var BATCH_SIZE = 30;
var i = 0;

function generateCommand() {
    if (i*BATCH_SIZE < NUM_LEDS) {
        var letter = String.fromCharCode(65+i);
        var chunks = [];
        for (var idx=0; idx<BATCH_SIZE; idx += 1) {
            var led;
            if (idx % 2 === 0) {
                led = matrix.rows[i][idx];
            } else {
                // Odd rows are backwards
                led = matrix.rows[i][BATCH_SIZE-1-idx];
            }
            chunks.push(String.fromCharCode(led.r * 63 + 33));
            chunks.push(String.fromCharCode(led.g * 63 + 33));
            chunks.push(String.fromCharCode(led.b * 63 + 33));
        }
        var cmd = 'A' + letter + chunks.join('');
        i += 1;
        return cmd;
    } else {
        i = 0;
        return 'B';
    }
}


class SerialAdapter {
    constructor(device, baudrate) {
        this.serialPort = new SerialPort(device, { baudrate: baudrate });
        this.ready = false;
        this.serialPort.on('open', () => {
            console.log('Serial port ready');
            this.ready = true;
            this.serialPort.on('data', data => {
                // console.log('data received: ' + data);
                data = `${data}`.trim();
                if (data.startsWith('OK')) {
                    var data = generateCommand();
                    this.serialPort.write(data+'\n', (err, results) => {
                        if (err) {
                            console.log('err ' + err);
                        // } else {
                        //     console.log('results ' + results);
                        }
                    });
                }
            });
        });
    }
}

var serialAdapter = new SerialAdapter('/dev/ttyUSB0', 115200)





import ws281x from 'rpi-ws281x-native';
import { createModel } from '../../js/animation';
import { rgb2Int } from '../../js/color';


const FPS = 60;

const BRIGHTNESS = 255; // [0, 255]
const GPIO_PIN_ROLL_A = 18;
const GPIO_PIN_ROLL_B = 12;

var {matrix, pushButton, setText} = createModel();

setText('vrijeschool mareland');

const NUM_LEDS_PER_ROLL = 150;
var pixelDataA = new Uint32Array(NUM_LEDS_PER_ROLL);
var pixelDataB = new Uint32Array(NUM_LEDS_PER_ROLL);

console.log('initializing');
ws281x.init(NUM_LEDS_PER_ROLL, {
    gpioPin: GPIO_PIN_ROLL_A,
    brightness: BRIGHTNESS,
});

process.on('SIGINT', () => {
    console.log('quitting');
    ws281x.reset();
    process.nextTick(() => { process.exit(0); });
});

function drawLeds() {
    matrix.forEachCell((rowIdx, colIdx, led) => {
        const roll = (rowIdx < 5) ? 0 : 1;
        const rollRowIdx = (rowIdx < 5) ? rowIdx : (rowIdx-5);
        var ledIdx = 0;
        if (rollRowIdx > 0) {
            ledIdx += rollRowIdx * matrix.numCols;
        }
        ledIdx += ((rollRowIdx % 2) === 0) ? colIdx : (matrix.numCols - colIdx);
        const pixelData = (roll === 0) ? pixelDataA : pixelDataB;
        if (ledIdx >= 0 && ledIdx < NUM_LEDS_PER_ROLL) { // sanity check
            pixelData[ledIdx] = rgb2Int(led.r, led.g, led.b);
        }
    });
    ws281x.render(pixelDataA);
    console.log('rendered');
}

setInterval(drawLeds, 1000 / FPS);

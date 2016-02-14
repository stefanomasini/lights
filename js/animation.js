import { hslToRgb } from './color';

const NUM_ROWS = 10;
const ROW_LENGTH = 30;

class Led {
    constructor() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }
}

function times(n, fn) {
    var res = [];
    for (var i=0; i < n; i += 1) {
        res.push(fn());
    }
    return res;
}

export function createModel() {
    let rows = times(NUM_ROWS, () => times(ROW_LENGTH, () => new Led()));

    // Animation
    let start = new Date().getTime();
    var bars = [0, 0];
    var barMax = [0, 0];

    const BAR_BACK_PRESSURE = 0.1; // Every sec

    var lastTickElapsed = 0;
    function tick() {
        let now = new Date().getTime();
        let elapsed = now - start;
        let elapsedInThisTick = elapsed - lastTickElapsed;
        const REV_PER_SEC = 0.5;
        const HUES_PER_SEC = 0.05;
        const BAR_WIDTH = 0.2;
        const pos = (1 - Math.sin(REV_PER_SEC * elapsed / 1000 * Math.PI * 2)) / 2;
        const hue = (1 - Math.sin(HUES_PER_SEC * elapsed / 1000 * Math.PI * 2)) / 2;
        bars.forEach((bar, barIdx) => {
            bars[barIdx] = Math.max((bars[barIdx] - (elapsedInThisTick / 1000 * BAR_BACK_PRESSURE * bars[barIdx] * 10)), 0);
            if (bars[barIdx] > 0.1) {
                barMax[barIdx] = Math.max(barMax[barIdx], bars[barIdx]);
            } else {
                barMax[barIdx] = 0;
            }
        });
        rows.forEach((row, rowIdx) => {
            row.forEach((led, cellIdx) => {
                var r, g, b;
                //if (rowIdx < 3) {
                //    const ledPos = cellIdx / (ROW_LENGTH-1);
                //    const dist = Math.abs(ledPos - pos);
                //    const intensity = Math.max(BAR_WIDTH - dist, 0) / BAR_WIDTH;
                //    [r, g, b] = hslToRgb(hue, 1, intensity * 0.5);
                //}
                bars.forEach((barSize, barIdx) => {
                    if ((barIdx === 0 && (rowIdx < 5 && rowIdx > 0)) || (barIdx === 1 && (rowIdx > 4 && rowIdx < 9))) {
                        const on = ((cellIdx / ROW_LENGTH) < barSize) ? 1 : 0;
                        [r, g, b] = hslToRgb((1-barSize) / 3, 1, on * barSize * 1.3);
                    }
                    if ((barIdx === 0 && (rowIdx == 0)) || (barIdx === 1 && (rowIdx == 9))) {
                        const on = ((cellIdx / ROW_LENGTH) < barMax[barIdx]) ? 1 : 0;
                        [r, g, b] = hslToRgb(0, 1, on * 0.5);
                    }
                });
                led.r = r;
                led.g = g;
                led.b = b;
            });
        });
        lastTickElapsed = elapsed;
    }

    function pushButton(btnIdx) {
        bars[btnIdx] += 0.1;
    }

    setInterval(tick, 20);
    return [rows, (idx) => pushButton(idx)];
}

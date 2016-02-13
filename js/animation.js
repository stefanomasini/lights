import { hslToRgb } from './color';

const NUM_ROWS = 3;
const ROW_LENGTH = 74;

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
    function tick() {
        let now = new Date().getTime();
        let elapsed = now - start;
        const REV_PER_SEC = 0.5;
        const HUES_PER_SEC = 0.05;
        const BAR_WIDTH = 0.2;
        const pos = (1 - Math.sin(REV_PER_SEC * elapsed / 1000 * Math.PI * 2)) / 2;
        const hue = (1 - Math.sin(HUES_PER_SEC * elapsed / 1000 * Math.PI * 2)) / 2;
        rows.forEach(row => {
            row.forEach((led, cellIdx) => {
                const ledPos = cellIdx / (ROW_LENGTH-1);
                const dist = Math.abs(ledPos - pos);
                const intensity = Math.max(BAR_WIDTH - dist, 0) / BAR_WIDTH;
                var [r, g, b] = hslToRgb(hue, 1, intensity * 0.5);
                led.r = r;
                led.g = g;
                led.b = b;
            });
        })
    }
    setInterval(tick, 20);
    return rows;
}

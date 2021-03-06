import { hslToRgb } from './color';
import { scanChar } from './text';


class Led {
    constructor() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }

    setRGB(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    setHSL(h, s, l) {
        var [r, g, b] = hslToRgb(h, s, l);
        this.setRGB(r, g, b);
    }
}

export class LedMatrix {
    constructor(numRows, numCols, rows) {
        this.numRows = numRows;
        this.numCols = numCols;
        if (rows) {
            this.rows = rows;
        } else {
            this.rows = times(numRows, () => times(numCols, () => new Led()));
        }
    }

    forEachCell(fn) {
        this.rows.forEach((row, rowIdx) => {
            row.forEach((led, cellIdx) => {
                fn(rowIdx, cellIdx, led);
            })
        });
    }

    submatrix(rows, cols) {
        let newRows = rows.map(rowIdx => {
            return cols.map(colIdx => {
                return this.rows[rowIdx][colIdx];
            });
        });
        return new LedMatrix(rows.length, cols.length, newRows);
    }

    fillRGB(r, g, b) {
        this.forEachCell((rowIdx, cellIdx, led) => led.setRGB(r, g, b));
    }

    ledAt(rowIdx, colIdx) {
        return this.rows[rowIdx][colIdx];
    }
}

function times(n, fn) {
    var res = [];
    for (var i=0; i < n; i += 1) {
        res.push(fn());
    }
    return res;
}

export function range(from, to) {
    var res = [];
    for (var i=from; i < to; i += 1) {
        res.push(i);
    }
    return res;
}


export class SpeedBars {
    static BAR_BACK_PRESSURE = 0.1; // Every sec

    constructor(maxBarA, barA, barB, maxBarB) {
        var now = new Date().getTime();
        this.maxBarA = maxBarA;
        this.barA = barA;
        this.barB = barB;
        this.maxBarB = maxBarB;
        this.waitStartedAt = now;
        this.state = 'WAIT';
        // this.resetRace();
    }

    tick(elapsed, elapsedInThisTick) {
        var now = new Date().getTime();
        if (this.state === 'WAIT') {
            this.drawWaitBars(now);
        } else if (this.state === 'RACING') {
            this.applyInertia(elapsedInThisTick);
            this.checkForRaceStop(now);
            this.drawRaceBars();
        } else if (this.state === 'REWARD') {
            if ((now - this.rewardStartedAt) > 5000) {
                this.endReward(now);
            } else {
                this.drawRewardBars(now);
            }
        }
    }

    drawWaitBars(now) {
        var elapsed = now - this.waitStartedAt;
        var cycle = (elapsed % 6000) / 6000;
        [this.barA, this.barB, this.maxBarA, this.maxBarB].forEach((bar) => {
            bar.forEachCell((rowIdx, colIdx, led) => {
                led.setHSL(cycle, 1, 0.1 + 0.4 * Math.abs(Math.sin(cycle * 7 * Math.PI)));
            });
        });
    }

    drawRewardBars(now) {
        var fn = (bar, idx) => {
            bar.forEachCell((rowIdx, colIdx, led) => {
                const on = (this.winner !== idx) ? false : (((now - this.rewardStartedAt) % 200) < 100);
                led.setHSL(0.3, 1, on * 0.5);
            });
        };
        [this.barA, this.barB].forEach(fn);
        [this.maxBarA, this.maxBarB].forEach(fn);
    }

    applyInertia(elapsedInThisTick) {
        this.bars.forEach((bar, barIdx) => {
            this.bars[barIdx] = Math.max((this.bars[barIdx] - (elapsedInThisTick / 1000 * SpeedBars.BAR_BACK_PRESSURE * this.bars[barIdx] * 10)), 0);
            if (this.bars[barIdx] > 0.1) {
                this.barMax[barIdx] = Math.max(this.barMax[barIdx], this.bars[barIdx]);
                this.stoppedAt = null;
            } else {
                this.barMax[barIdx] = 0;
            }
        });
    }

    startRace() {
        console.log('startRace');
        this.bars = [0, 0];
        this.barMax = [0, 0];
        this.raceStarted = true;
        this.stoppedAt = null;
        this.space = [0, 0];
        this.winner = null;
        this.state = 'RACING';
    }

    checkForRaceStop(now) {
        var stopped = [this.barMax[0] === 0, this.barMax[1] === 0];
        if (this.raceStarted && stopped[0] && stopped[1] && !this.stoppedAt) {
            this.stoppedAt = now;
        }
        if (this.stoppedAt && (now - this.stoppedAt) > 3000) {
            this.endRace(now);
        }
    }

    drawRaceBars() {
        [this.barA, this.barB].forEach((bar, idx) => {
            bar.forEachCell((rowIdx, colIdx, led) => {
                const barSize = this.bars[idx];
                const on = ((colIdx / bar.numCols) < barSize) ? 1 : 0;
                led.setHSL((1 - barSize) / 3, 1, on * barSize * 1.2);
            });
        });
        [this.maxBarA, this.maxBarB].forEach((maxBar, idx) => {
            maxBar.forEachCell((rowIdx, colIdx, led) => {
                // const on = ((colIdx / maxBar.numCols) < this.barMax[idx]) ? 1 : 0;
                const on = ((colIdx / maxBar.numCols) < this.space[idx]) ? 1 : 0;
                led.setHSL(0, 1, on * 0.5);
            });
        });
    }

    winRace(now, winnerIdx) {
        this.winner = winnerIdx;
        this.endRace(now);
    }

    endRace(now) {
        console.log('endRace');
        this.raceStarted = false;
        this.stoppedAt = null;
        this.space = [0, 0];
        if (this.winner !== null) {
            this.rewardStartedAt = now;
            this.state = 'REWARD';
        } else {
            this.waitStartedAt = now;
            this.state = 'WAIT';
        }
    }

    endReward(now) {
        this.waitStartedAt = now;
        this.state = 'WAIT';
    }

    pushButton(btnIdx) {
        var now = new Date().getTime();
        if (this.state === 'WAIT') {
            this.startRace();
        }
        if (this.raceStarted) {
            this.bars[btnIdx] += 0.07;
            this.space[btnIdx] += 0.02;
            if (this.space[btnIdx] > 1) {
                this.space[btnIdx] = 1;
                this.winRace(now, btnIdx);
            }
        }
    }
}


export class OscilatingBar {
    static REV_PER_SEC = 0.5;
    static HUES_PER_SEC = 0.05;
    static BAR_WIDTH = 0.2;

    constructor(matrix) {
        this.matrix = matrix;
    }

    tick(elapsed, elapsedInThisTick) {
        const pos = (1 - Math.sin(OscilatingBar.REV_PER_SEC * elapsed / 1000 * Math.PI * 2)) / 2;
        const hue = (1 - Math.sin(OscilatingBar.HUES_PER_SEC * elapsed / 1000 * Math.PI * 2)) / 2;

        this.matrix.forEachCell((rowIdx, colIdx, led) => {
            const ledPos = colIdx / (this.matrix.numCols-1);
            const dist = Math.abs(ledPos - pos);
            const intensity = Math.max(OscilatingBar.BAR_WIDTH - dist, 0) / OscilatingBar.BAR_WIDTH;
            led.setHSL(hue, 1, intensity * 0.5);
        });
    }
}


export class ScrollingText {
    static CHAR_PER_SEC = 3;
    static NUM_COLS_PER_CHAR = 6;

    constructor(matrix) {
        this.matrix = matrix;
        this.text = '';
        this.scrollFloat = -this.matrix.numCols;
    }

    tick(elapsed, elapsedInThisTick) {
        this.matrix.fillRGB(0, 0, 0);
        this.scrollFloat += ScrollingText.CHAR_PER_SEC * ScrollingText.NUM_COLS_PER_CHAR * elapsedInThisTick / 1000;

        const scroll = Math.floor(this.scrollFloat);
        const numChars = Math.ceil(this.matrix.numCols / ScrollingText.NUM_COLS_PER_CHAR) + 1;
        const cursorHead = (scroll > 0) ? Math.floor(scroll / ScrollingText.NUM_COLS_PER_CHAR) : Math.ceil(scroll / ScrollingText.NUM_COLS_PER_CHAR);
        for (var charIdx = 0; charIdx < numChars; charIdx += 1) {
            const actualCharIdx = cursorHead + charIdx;
            if (actualCharIdx >= 0) {
                const char = this.text[actualCharIdx % this.text.length];
                scanChar(char, (rowIdx, colIdx, value) => {
                    const charScroll = scroll % ScrollingText.NUM_COLS_PER_CHAR;
                    const actualColIdx = colIdx + charIdx * ScrollingText.NUM_COLS_PER_CHAR - charScroll;
                    if (actualColIdx >= 0 && actualColIdx < this.matrix.numCols && rowIdx >= 0 && rowIdx < this.matrix.numRows) {
                        this.matrix.ledAt(rowIdx, actualColIdx).setRGB(value, value, value);
                    }
                });
            }
        }
    }

    setText(text) {
        this.text = text.toLowerCase() + ' ';
        this.scrollFloat = - this.matrix.numCols * 1.5;
    }
}


export function runApps(apps) {
    let start = new Date().getTime();
    var lastTickElapsed = 0;
    function tick() {
        let now = new Date().getTime();
        let elapsed = now - start;
        let elapsedInThisTick = elapsed - lastTickElapsed;
        apps.forEach(app => app.tick(elapsed, elapsedInThisTick));
        lastTickElapsed = elapsed;
    }
    setInterval(tick, 20);
}

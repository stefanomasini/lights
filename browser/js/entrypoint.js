import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { range, LedMatrix, SpeedBars, ScrollingText, OscilatingBar, runApps } from '../../js/animation';

const BLOCK_SIZE = 6;
const PADDING = 8;
const ROWS_DISTANCE = 8;
const FPS = 60;


const NUM_ROWS = 10;
const ROW_LENGTH = 30;


let matrixA = new LedMatrix(NUM_ROWS, ROW_LENGTH);
let matrixB = new LedMatrix(NUM_ROWS, ROW_LENGTH);

var speedBars = new SpeedBars(
    matrixA.submatrix([0], range(0, matrixA.numCols)),
    matrixA.submatrix([1,2,3,4], range(0, matrixA.numCols)),
    matrixA.submatrix([5,6,7,8], range(0, matrixA.numCols)),
    matrixA.submatrix([9], range(0, matrixA.numCols)),
);

var scrollingText = new ScrollingText(matrixB.submatrix([2,3,4,5,6,7,8], range(0, matrixB.numCols)));
scrollingText.setText('vrijeschool mareland');

runApps([
    speedBars,
    new OscilatingBar(matrixB.submatrix([0,1,9], range(0, matrixB.numCols))),
    scrollingText,
]);



var _forceUpdate = null;

class Main extends Component {
    render() {
        return <div style={{ width: 750, paddingTop: 30 }} onKeyDown={e => {
                if (e.keyCode === 49) {
                    speedBars.pushButton(0);
                }
                if (e.keyCode === 48) {
                    speedBars.pushButton(1);
                }
            }}>
            <i style={{color: '#888888'}}>Vrijeschool Mareland Bazar 2016</i>
            <VoetstappenSimulator/>
            <ScrollingTextExample/>
        </div>;
    }

    componentDidMount() {
        _forceUpdate = () => {
            this.forceUpdate();
        }
    }
}

class VoetstappenSimulator extends Component {
    render() {
        return <div>
            <h2 style={{color: '#AAAAAA', marginTop: 7}}>Voetstappen power meter (simulation)</h2>
            <MatrixDisplay matrix={matrixA}/>
            <p style={{clear: 'both'}}>
                <button className="btn" onClick={() => speedBars.pushButton(0)}>Left pad (also press "1")</button>
                <button style={{float: 'right'}} className="btn" onClick={() => speedBars.pushButton(1)}>Right pad (also press "0")</button>
            </p>
        </div>;
    }
}

class ScrollingTextExample extends Component {
    render() {
        return <div>
            <h2 style={{color: '#AAAAAA', marginTop: 30}}>Scrolling text example</h2>
            <MatrixDisplay matrix={matrixB}/>
            <p style={{color: 'lightgray', marginTop: 20}}>
                Type some text to scroll: <input style={{color: 'black'}} type="text" onChange={e => scrollingText.setText(e.target.value)}/>
            </p>
        </div>;
    }
}

const MatrixDisplay = ({matrix}) => <div style={{
        clear: 'both',
        height: 280,
        backgroundColor: '#111111',
        margin: '30px 0 30px 0',
        padding: 30,
        border: '1px solid gray'
        }}>
        {matrix.rows.map((row, rowIdx) => <Row key={rowIdx} cells={row}/>)}
    </div>;

class Row extends Component {
    render() {
        return <div style={{clear: 'both'}}>
            {this.props.cells.map((cell, cellIdx) => <Block key={cellIdx} cellIdx={cellIdx} led={cell}/>)}
        </div>;
    }
}

function calcScreenColorFromLed(led) {
    //return led.r * 255;
    //console.log('#' + Number(((256 + led.r * 255) * 256 + (led.g * 255)) * 256 + (led.b * 255)).toString(16).slice(1));
    return `rgb(${Math.floor(led.r * 255)}, ${Math.floor(led.g * 255)}, ${Math.floor(led.b * 255)})`;
    //return '#' + Number((Math.floor(led.r * 255) * 256 + Math.floor(led.g * 255)) * 256 + Math.floor(led.b * 255)).toString(16);
}

class Block extends Component {
    render() {
        //var col = calcScreenColorFromLed(this.props.led);
        //
        //if (col.length !== 7) {
        //    console.log(col);
        //}
        return <div style={{
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                float: 'left',
                backgroundColor: calcScreenColorFromLed(this.props.led),
                marginLeft: PADDING,
                marginRight: PADDING,
                marginTop: ROWS_DISTANCE,
                marginBottom: ROWS_DISTANCE,
                borderRadius: BLOCK_SIZE / 2,
            }}>
        </div>;
    }
}

ReactDOM.render(<Main/>, document.getElementById('main'));
setInterval(() => { _forceUpdate && _forceUpdate() }, 1000 / FPS);

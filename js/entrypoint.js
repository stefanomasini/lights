import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createModel } from './animation';

const BLOCK_SIZE = 6;
const PADDING = 4;
const ROWS_DISTANCE = 30;


var rows = createModel();

let updateView = renderWithReact(rows);
const FPS = 60;
setInterval(updateView, 1000 / FPS);


// ---- React rendering --------------------------------------

function renderWithReact(rows) {
    let mainEl = document.getElementById('main');

    var _forceUpdate = null;

    class Main extends Component {
        render() {
            return <div>
                <button className="btn" onClick={() => this.onClick()}>Button</button>
                <div style={{marginTop: 20}}>
                    {rows.map((row, rowIdx) => <Row key={rowIdx} cells={row}/>)}
                </div>
            </div>;
        }

        componentDidMount() {
            _forceUpdate = () => {
                this.forceUpdate();
            }
        }

        onClick() {
            console.log('foo');
        }
    }

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

    ReactDOM.render(<Main rows={rows}/>, mainEl);

    return () => _forceUpdate && _forceUpdate();
}
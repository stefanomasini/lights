var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        //'babel-polyfill': 'babel-polyfill',
        "main": "entrypoint"
    },
    output: {
        path: 'dist',
        publicPath: '/',
        filename: '[name].js'
    },
    resolve: {
        root: path.resolve(__dirname, 'js'),
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.js$/,
            include: path.resolve(__dirname, 'js'),
            loader: 'babel-loader',

            query: {
                plugins: ["transform-decorators-legacy"],
                presets: ["es2015", "stage-0", "react"],
            }
        }]
    },
    debug: true
};

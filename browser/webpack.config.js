var path = require('path');
var webpack = require('webpack');


module.exports = {
    entry: {
        "main": "./js/entrypoint"
    },
    output: {
        path: 'dist',
        publicPath: '/',
        filename: '[name].js'
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            loader: 'babel-loader',
            test: /\.js$/,
            include: [path.resolve(__dirname, 'js'), path.resolve(__dirname, '..', 'js')],

            query: {
                plugins: ["babel-plugin-transform-decorators-legacy"],
                presets: ["babel-preset-es2015", "babel-preset-stage-0", "babel-preset-react"],
            }
        }]
    },
    debug: true
};

/* eslint-env node */
var path = require('path'),
    webpack = require('webpack'),
    CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
    entry: {
        videoGL: './src/apps/videoGL',
        fractal: './src/apps/fractal'
    },
    output: {
        path: './build',
        filename: '[name].js'
    },
    resolve: {
        root: [path.join(__dirname, '/node_modules/')],
        alias: {
            //lodash: '/lodash/dist/lodash',
            jquery: path.join(__dirname, '/node_modules/jquery/dist/jquery')
        }
    },
    module: {
        loaders: [
            { test: /\.js$/,		loader: 'strict'},
            { test: /\.js$/,        exclude: /node_modules/, loader: 'babel-loader'},
            { test: /\.jsx?$/,      exclude: /node_modules/, loader: 'babel-loader?experimental&optional=runtime' },
            { test: /\.glsl$/,      loader: 'shader' }
        ],
        noParse: [

        ]
    },
    glsl: {
        chunkPath: "chunks"
    },
    plugins: [
        new CommonsChunkPlugin({ name: 'vendor' }),
        new webpack.ContextReplacementPlugin(/.*$/, /a^/),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuary: 'jquery',
            'window.jQuery': 'jquery'
        })
        //new ngminPlugin()
    ]
};

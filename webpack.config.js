const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/main.js'
    },

    devtool: 'source-map',

    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'build.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src/'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'typeof CANVAS_RENDERER': JSON.stringify(true),
            'typeof WEBGL_RENDERER': JSON.stringify(true)
        })
    ],

    devServer: {
        contentBase: path.resolve(__dirname, 'public')
    },
    watch: true,
    mode: 'development'
};
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '../AiDiagram.Client/wwwroot/js'),
        filename: 'excalidraw-bundle.js',
        library: {
            name: 'ExcalidrawInterop',
            type: 'var'
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }

        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new (require('webpack').DefinePlugin)({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.IS_PREACT': JSON.stringify('false')
        })
    ],

    externals: {
        // defined via script tags if needed, but we bundling everything
    }
};
